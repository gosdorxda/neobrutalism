import fs from "fs";
import path from "path";
import { getSettings } from "@/lib/settings";
import { getBatches, type Batch } from "@/lib/data";
import { getSolPrice, getStats, type CachedStats } from "@/lib/cache";
import { getIncomingTransfers, lamportsToSol, type IncomingTransfer } from "@/lib/solana";
import {
  isTelegramConfigured,
  sendFundMessage,
  sendBatchMessage,
} from "@/lib/telegram";

const STATE_FILE = path.join(process.cwd(), "data", "fund-activity.json");
const LOG_CAP = 200;

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G5wUGd5SWHWfcAr";
const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe4BenWYt";

// Only these tokens get auto-posted. Unknown tokens are skipped (anti-spam).
const ALLOWED_TOKENS = new Set(["SOL", "USDC", "USDT", "CATBOWL"]);

export type FundLogEntry = {
  id: number;
  ts: number;
  type: "donation" | "batch" | "error";
  status: "posted" | "skipped_dust" | "skipped_internal" | "error";
  txHash: string | null;
  sender: string | null;
  token: string;
  amount: number | null;
  usdValue: number | null;
  message: string;
};

type FundState = {
  lastSignature: string | null;
  currentBatchId: number | null;
  currentBatchMessageId: number | null;
  lastBatchSnapshot: string;
  log: FundLogEntry[];
};

const defaultState: FundState = {
  lastSignature: null,
  currentBatchId: null,
  currentBatchMessageId: null,
  lastBatchSnapshot: "",
  log: [],
};

function readState(): FundState {
  try {
    const data = fs.readFileSync(STATE_FILE, "utf8");
    return { ...defaultState, ...JSON.parse(data) };
  } catch {
    return { ...defaultState };
  }
}

function writeState(state: FundState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

export function readFundLog(): FundLogEntry[] {
  return readState().log.slice().reverse(); // newest first
}

export function pushLog(entry: Omit<FundLogEntry, "id">): FundLogEntry {
  const state = readState();
  const full = appendLog(state, entry);
  writeState(state);
  return full;
}

export type ManualResult = {
  ok: boolean;
  error?: string;
  messageId?: number | null;
};

function nowTs() {
  return Math.floor(Date.now() / 1000);
}

function linkOrSolscan(tx: string): string {
  return tx.startsWith("http") ? tx : solscanUrl(tx);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applyTemplate(tpl: string, values: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) =>
    k in values ? escapeHtml(values[k]) : `{${k}}`
  );
}

export async function postManualRewards(input: {
  amountSol?: number;
  amountUsd?: number;
  txHash?: string;
  batch?: string;
}): Promise<ManualResult> {
  if (!isTelegramConfigured()) return { ok: false, error: "telegram-not-configured" };
  const settings = getSettings();
  const sol = input.amountSol ?? 0;
  const usd = input.amountUsd ?? 0;
  const amount = sol ? `${sol} SOL` : usd ? `$${usd.toLocaleString("en-US")}` : "";
  const usdStr = sol && usd ? ` (≈ $${usd.toLocaleString("en-US")})` : "";
  const text = applyTemplate(settings.tplRewards, {
    date: fmtDate(nowTs()),
    amount,
    usd: usdStr,
    tx: input.txHash ? linkOrSolscan(input.txHash) : "",
    batch: input.batch || "",
  });
  const send = await sendFundMessage(text);
  pushLog({
    ts: nowTs(),
    type: "donation",
    status: send.ok ? "posted" : "error",
    txHash: input.txHash || null,
    sender: null,
    token: "SOL",
    amount: sol || null,
    usdValue: usd || null,
    message: send.ok ? text : `error: ${send.error}`,
  });
  return { ok: send.ok, error: send.error, messageId: send.messageId };
}

export async function postManualPurchase(input: {
  store?: string;
  item?: string;
  totalUsd?: number;
  txHash?: string;
  receiptUrl?: string;
  batch?: string;
}): Promise<ManualResult> {
  if (!isTelegramConfigured()) return { ok: false, error: "telegram-not-configured" };
  const settings = getSettings();
  const usd = input.totalUsd ?? 0;
  const text = applyTemplate(settings.tplPurchase, {
    date: fmtDate(nowTs()),
    amount: usd ? `$${usd.toLocaleString("en-US")}` : "",
    store: input.store || "",
    item: input.item || "",
    receipt: input.receiptUrl || "",
    tx: input.txHash ? linkOrSolscan(input.txHash) : "",
    batch: input.batch || "",
  });
  const send = await sendFundMessage(text);
  pushLog({
    ts: nowTs(),
    type: "donation",
    status: send.ok ? "posted" : "error",
    txHash: input.txHash || null,
    sender: null,
    token: "USD",
    amount: null,
    usdValue: usd || null,
    message: send.ok ? text : `error: ${send.error}`,
  });
  return { ok: send.ok, error: send.error, messageId: send.messageId };
}

function appendLog(state: FundState, entry: Omit<FundLogEntry, "id">): FundLogEntry {
  const id = state.log.length > 0 ? Math.max(...state.log.map((l) => l.id)) + 1 : 1;
  const full: FundLogEntry = { id, ...entry };
  state.log.push(full);
  if (state.log.length > LOG_CAP) {
    state.log = state.log.slice(-LOG_CAP);
  }
  return full;
}

function shortAddr(addr: string | null): string {
  if (!addr) return "-";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function fmtDate(ts: number | null): string {
  const d = ts ? new Date(ts * 1000) : new Date();
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function solscanUrl(sig: string) {
  return `https://solscan.io/tx/${sig}`;
}

function classifyMint(mint: string, tokenCa: string): string {
  if (mint === USDC_MINT) return "USDC";
  if (mint === USDT_MINT) return "USDT";
  if (mint === tokenCa) return "CATBOWL";
  return `token ${shortAddr(mint)}`;
}

function formatDonation(
  t: IncomingTransfer,
  token: string,
  amount: number,
  usdValue: number | null,
  tpl: string
): string {
  const usdStr = usdValue !== null ? ` (≈ $${usdValue.toLocaleString("en-US")})` : "";
  return applyTemplate(tpl, {
    date: fmtDate(t.blockTime),
    amount: String(amount),
    token,
    usd: usdStr,
    tx: solscanUrl(t.signature),
    sender: shortAddr(t.sender),
  });
}

function currentBatch(batches: Batch[]): Batch | null {
  return (
    batches.find((b) => b.status === "In Progress" || b.status === "Feeding") ||
    batches.find((b) => b.isActive) ||
    null
  );
}

function batchSnapshot(b: Batch, stats: CachedStats, tpl: string): string {
  const rewardsUsd = stats.totalFees ? `$${stats.totalFees.toLocaleString("en-US")}` : "-";
  const rewardsSol = stats.totalFeesSol ? `${stats.totalFeesSol.toFixed(4)} SOL` : "";
  const rewards = rewardsSol ? `${rewardsUsd} (${rewardsSol})` : rewardsUsd;
  return applyTemplate(tpl, {
    name: b.name || "Batch",
    id: String(b.id),
    status: b.status,
    period: `${b.startDate || "?"} → ${b.targetDate || "?"}`,
    rewards,
    bowls: stats.estimatedBowls.toLocaleString("en-US"),
  });
}

export type CheckResult = {
  ok: boolean;
  donationsPosted: number;
  donationsSkipped: number;
  batchUpdated: boolean;
  error?: string;
};

export async function testBatchPost(): Promise<ManualResult> {
  if (!isTelegramConfigured()) return { ok: false, error: "telegram-not-configured" };
  const state = readState();
  let res: ManualResult = { ok: false, error: "no-active-batch" };
  try {
    await refreshCurrentBatch(state);
    res = { ok: true };
  } catch (e) {
    res = { ok: false, error: String(e) };
  }
  writeState(state);
  return res;
}

async function refreshCurrentBatch(state: FundState): Promise<void> {
  const batches = getBatches();
  const cur = currentBatch(batches);
  if (!cur) return;

  const stats = await getStats();
  const snap = batchSnapshot(cur, stats, getSettings().tplBatch);
  const send = await sendBatchMessage(snap);
  if (send.ok && send.messageId != null) {
    state.currentBatchId = cur.id;
    state.currentBatchMessageId = send.messageId;
    state.lastBatchSnapshot = snap;
    appendLog(state, {
      ts: Math.floor(Date.now() / 1000),
      type: "batch",
      status: "posted",
      txHash: null,
      sender: null,
      token: "-",
      amount: null,
      usdValue: null,
      message: `batch status posted (#${cur.id})`,
    });
  }
}

export async function runFundActivityCheck(): Promise<CheckResult> {
  const settings = getSettings();
  const result: CheckResult = {
    ok: true,
    donationsPosted: 0,
    donationsSkipped: 0,
    batchUpdated: false,
  };

  if (!settings.fundActivityEnabled) {
    return result;
  }
  if (!isTelegramConfigured()) {
    result.ok = false;
    result.error = "telegram-not-configured";
    return result;
  }
  if (!settings.foundationWallet) {
    result.ok = false;
    result.error = "foundation-wallet-not-set";
    return result;
  }

  const state = readState();
  const solPrice = await getSolPrice();

  // --- Donations ---
  try {
    const { transfers, latestSignature } = await getIncomingTransfers(
      settings.foundationWallet,
      state.lastSignature
    );

    // process oldest-first for chronological posting
    const ordered = [...transfers].reverse();

    for (const t of ordered) {
      // skip internal transfers from creator wallet
      if (t.sender && settings.creatorWallet && t.sender === settings.creatorWallet) {
        appendLog(state, {
          ts: t.blockTime || Math.floor(Date.now() / 1000),
          type: "donation",
          status: "skipped_internal",
          txHash: t.signature,
          sender: t.sender,
          token: t.solLamports ? "SOL" : classifyMint(t.splMint || "", settings.tokenCa),
          amount: t.solLamports ? lamportsToSol(t.solLamports) : t.splAmount ?? null,
          usdValue: null,
          message: "skipped: internal transfer from creator wallet",
        });
        result.donationsSkipped++;
        continue;
      }

      let token: string;
      let amount: number;
      let usdValue: number | null = null;
      let isUnknown = false;

      if (t.solLamports) {
        token = "SOL";
        amount = lamportsToSol(t.solLamports);
        if (solPrice !== null) usdValue = amount * solPrice;
      } else if (t.splMint) {
        token = classifyMint(t.splMint, settings.tokenCa);
        amount = t.splAmount ?? 0;
        if (token === "USDC" || token === "USDT") {
          usdValue = amount; // 1:1
        } else if (token === "CATBOWL") {
          usdValue = null; // dex price not reliably fetched here
        } else {
          isUnknown = true;
          usdValue = null;
        }
      } else {
        continue; // no incoming value
      }

      // whitelist filter — only post known/allowed tokens
      if (!ALLOWED_TOKENS.has(token)) {
        appendLog(state, {
          ts: t.blockTime || Math.floor(Date.now() / 1000),
          type: "donation",
          status: "skipped_dust",
          txHash: t.signature,
          sender: shortAddr(t.sender),
          token,
          amount,
          usdValue: null,
          message: `skipped: token "${token}" not in whitelist (SOL/USDT/USDC/CATBOWL)`,
        });
        result.donationsSkipped++;
        continue;
      }

      // dust filter (only for valued tokens)
      const minUsd = settings.fundActivityMinUsd ?? 1;
      if (usdValue !== null && !isUnknown && usdValue < minUsd) {
        appendLog(state, {
          ts: t.blockTime || Math.floor(Date.now() / 1000),
          type: "donation",
          status: "skipped_dust",
          txHash: t.signature,
          sender: shortAddr(t.sender),
          token,
          amount,
          usdValue,
          message: `skipped: below $${minUsd} threshold`,
        });
        result.donationsSkipped++;
        continue;
      }

      const text = formatDonation(t, token, amount, usdValue, settings.tplDonation);
      const send = await sendFundMessage(text);

      appendLog(state, {
        ts: t.blockTime || Math.floor(Date.now() / 1000),
        type: "donation",
        status: send.ok ? "posted" : "error",
        txHash: t.signature,
        sender: shortAddr(t.sender),
        token,
        amount,
        usdValue,
        message: send.ok ? text : `error: ${send.error || "send-failed"}`,
      });

      if (send.ok) result.donationsPosted++;
      else {
        result.ok = false;
        result.error = result.error || send.error || "send-failed";
      }
    }

    if (latestSignature) state.lastSignature = latestSignature;
  } catch (e) {
    result.ok = false;
    result.error = result.error || `donation-error: ${String(e)}`;
    appendLog(state, {
      ts: Math.floor(Date.now() / 1000),
      type: "error",
      status: "error",
      txHash: null,
      sender: null,
      token: "-",
      amount: null,
      usdValue: null,
      message: `donation polling error: ${String(e)}`,
    });
  }

  // --- Current batch refresh ---
  try {
    await refreshCurrentBatch(state);
  } catch (e) {
    result.ok = false;
    result.error = result.error || `batch-error: ${String(e)}`;
    appendLog(state, {
      ts: Math.floor(Date.now() / 1000),
      type: "error",
      status: "error",
      txHash: null,
      sender: null,
      token: "-",
      amount: null,
      usdValue: null,
      message: `batch refresh error: ${String(e)}`,
    });
  }

  writeState(state);
  return result;
}
