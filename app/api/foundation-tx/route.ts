import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const TX_LIMIT = 50;

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const PUMPFUN = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";

async function rpcCall(method: string, params: unknown[]) {
  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  const data = await res.json();
  return data?.result;
}

function shorten(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(timestamp: number | null): string {
  if (!timestamp) return "Unknown";
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function detectProgramType(instructions: unknown[]) {
  const programIds = new Set<string>();
  for (const ix of instructions) {
    const programId = (ix as { programId?: string })?.programId;
    if (programId) programIds.add(programId);
  }
  if (programIds.has(PUMPFUN)) {
    return { type: "fee-collection" as const, program: PUMPFUN };
  }
  if (programIds.has(SYSTEM_PROGRAM)) {
    return { type: "sol-transfer" as const, program: SYSTEM_PROGRAM };
  }
  return { type: "other" as const, program: null };
}

async function parseTx(signature: string, blockTime: number | null, err: unknown, walletAddress: string) {
  try {
    const tx = await rpcCall("getTransaction", [
      signature,
      { encoding: "jsonParsed", maxSupportedTransactionVersion: 0, commitment: "confirmed" },
    ]);

    const meta = tx?.meta;
    const status = meta?.err || err ? "failed" as const : "success" as const;
    const feeLamports = meta?.fee ?? null;
    const feeSol = feeLamports != null ? feeLamports / 1_000_000_000 : null;

    const message = tx?.transaction?.message;
    const instructions = message?.instructions || [];
    const { type } = detectProgramType(instructions);

    if (type === "other") return null;

    let from: string | null = null;
    let to: string | null = null;
    let amountSol: number | null = null;

    for (const ix of instructions) {
      const parsed = (ix as { parsed?: { type?: string; info?: Record<string, unknown> } })?.parsed;
      if (parsed?.type === "transfer" && parsed.info) {
        const info = parsed.info;
        if (typeof info.lamports === "number") {
          from = String(info.source || "");
          to = String(info.destination || "");
          amountSol = info.lamports / 1_000_000_000;
        }
      }
    }

    if (amountSol == null && meta) {
      const accountKeys = message?.accountKeys || [];
      const index = accountKeys.findIndex((a: { pubkey?: string }) => a.pubkey === walletAddress);
      if (index >= 0 && meta.preBalances && meta.postBalances) {
        const delta = (meta.postBalances[index] - meta.preBalances[index]) / 1_000_000_000;
        if (Math.abs(delta) > 0.000001) {
          amountSol = delta;
        }
      }
    }

    const readable = type === "fee-collection"
      ? "Creator Fee"
      : amountSol != null
      ? `${amountSol >= 0 ? "+" : ""}${amountSol.toFixed(6)} SOL`
      : "Transaction";

    return {
      signature,
      timestamp: blockTime,
      status,
      feeSol,
      type,
      from: from ? shorten(from) : null,
      to: to ? shorten(to) : null,
      amountSol,
      tokenAmount: null,
      tokenSymbol: null,
      programInvolved: null,
      readable,
      formattedDate: formatDate(blockTime),
      timeAgo: timeAgo(blockTime),
      solscanUrl: `https://solscan.io/tx/${signature}`,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const { foundationWallet } = getSettings();

  if (!foundationWallet) {
    return NextResponse.json([]);
  }

  try {
    const signatures = await rpcCall("getSignaturesForAddress", [foundationWallet, { limit: TX_LIMIT }]);
    const rawSignatures = Array.isArray(signatures)
      ? signatures.map((item: { signature: string; blockTime: number | null; err: unknown }) => ({
          signature: item.signature,
          blockTime: item.blockTime,
          err: item.err,
        }))
      : [];

    const results = await Promise.all(
      rawSignatures.map((raw) => parseTx(raw.signature, raw.blockTime, raw.err, foundationWallet))
    );

    const transactions = results.filter(Boolean);

    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json([]);
  }
}