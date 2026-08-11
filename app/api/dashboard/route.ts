import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const PUMPFUN_SUPPLY = 1_000_000_000;
const COINGECKO_SOL_URL = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

const TX_LIMIT = 12;

type ParsedInfo = {
  lamports?: number;
  source?: string;
  destination?: string;
  authority?: string;
  amount?: number;
  tokenAmount?: {
    uiAmount?: number;
    symbol?: string;
    decimals?: number;
  };
};

// SPL Token program ids
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM = "TokenzQdBNbBqPgpMEGLUEe8RVAeBBnH9gpoy4juwPk";
const SYSTEM_PROGRAM = "11111111111111111111111111111111";

function formatUsd(value: number | null | undefined): string | null {
  if (value == null || isNaN(value)) return null;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(value < 0.01 ? 8 : value < 1 ? 6 : 4)}`;
}

function formatNumber(value: number | null | undefined): string | null {
  if (value == null || isNaN(value)) return null;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString();
}

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

async function fetchSolPrice(): Promise<number | null> {
  try {
    const res = await fetch(COINGECKO_SOL_URL, { next: { revalidate: 60 } });
    const data = await res.json();
    const price = data?.solana?.usd;
    return typeof price === "number" ? price : null;
  } catch {
    try {
      const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT", {
        next: { revalidate: 60 },
      });
      const data = await res.json();
      const price = Number(data?.price);
      return !isNaN(price) ? price : null;
    } catch {
      return null;
    }
  }
}

async function fetchTokenData(tokenCa: string, projectName: string) {
  try {
    const res = await fetch(
      `https://advanced-api-v2.pump.fun/coins/metadata/${tokenCa}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) throw new Error(`PumpFun ${res.status}`);
    const data = await res.json();

    const marketCap = data.marketcap ? Number(data.marketcap) : null;
    const priceUsd = marketCap ? marketCap / PUMPFUN_SUPPLY : null;
    const volume = data.volume_usd ? Number(data.volume_usd) : null;
    const holders = data.num_holders_v2
      ? Number(data.num_holders_v2)
      : data.num_holders
      ? Number(data.num_holders)
      : null;

    return {
      ca: tokenCa,
      name: data.name || projectName,
      symbol: data.ticker ? `$${data.ticker}` : `$${projectName}`,
      price: priceUsd ? `$${priceUsd.toFixed(10)}` : null,
      marketCap: formatUsd(marketCap),
      marketCapRaw: marketCap,
      volume: formatUsd(volume),
      holders: formatNumber(holders),
      holdersRaw: holders,
      totalTx: formatNumber(data.transactions ? Number(data.transactions) : null),
      totalTxRaw: data.transactions ? Number(data.transactions) : null,
      buyTx: formatNumber(data.buy_transactions ? Number(data.buy_transactions) : null),
      sellTx: formatNumber(data.sell_transactions ? Number(data.sell_transactions) : null),
      snipers: formatNumber(data.sniper_count ? Number(data.sniper_count) : null),
      athMarketCap: formatUsd(data.ath_market_cap ? Number(data.ath_market_cap) : null),
      athMarketCapRaw: data.ath_market_cap ? Number(data.ath_market_cap) : null,
      devHolding: data.bundler_owned_percentage_v2
        ? `${(Number(data.bundler_owned_percentage_v2) * 100).toFixed(2)}%`
        : "0.00%",
      devHoldingRaw: data.bundler_owned_percentage_v2
        ? Number(data.bundler_owned_percentage_v2) * 100
        : 0,
      imageUrl: data.imageUrl || null,
      buyUrl: `https://pump.fun/coin/${tokenCa}`,
      solscanUrl: `https://solscan.io/token/${tokenCa}`,
    };
  } catch {
    return {
      ca: tokenCa,
      name: projectName,
      symbol: `$${projectName}`,
      price: null,
      marketCap: null,
      marketCapRaw: null,
      volume: null,
      holders: null,
      holdersRaw: null,
      totalTx: null,
      totalTxRaw: null,
      buyTx: null,
      sellTx: null,
      snipers: null,
      athMarketCap: null,
      athMarketCapRaw: null,
      devHolding: "0.00%",
      devHoldingRaw: 0,
      imageUrl: null,
      buyUrl: `https://pump.fun/coin/${tokenCa}`,
      solscanUrl: `https://solscan.io/token/${tokenCa}`,
    };
  }
}

async function fetchSolBalance(wallet: string): Promise<number | null> {
  try {
    const result = await rpcCall("getBalance", [wallet]);
    const lamports = result?.value;
    return typeof lamports === "number" ? lamports / 1_000_000_000 : null;
  } catch {
    return null;
  }
}

async function fetchDevClaimable(wallet: string, mint: string): Promise<number | null> {
  try {
    const url = `https://pumpdev.io/api/claim-account?publicKey=${encodeURIComponent(wallet)}&mint=${encodeURIComponent(mint)}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return typeof data?.totalClaimable === "number" ? data.totalClaimable : null;
  } catch {
    return null;
  }
}

type RawTx = {
  signature: string;
  blockTime: number | null;
  err: unknown;
};

async function fetchSignatures(address: string): Promise<RawTx[]> {
  try {
    const result = await rpcCall("getSignaturesForAddress", [
      address,
      { limit: TX_LIMIT },
    ]);
    return Array.isArray(result)
      ? result.map((item: RawTx) => ({
          signature: item.signature,
          blockTime: item.blockTime,
          err: item.err,
        }))
      : [];
  } catch {
    return [];
  }
}

type ParsedTx = {
  signature: string;
  timestamp: number | null;
  status: "success" | "failed";
  feeSol: number | null;
  type: "sol-transfer" | "token-transfer" | "swap" | "contract" | "unknown";
  from: string | null;
  to: string | null;
  amountSol: number | null;
  tokenAmount: number | null;
  tokenSymbol: string | null;
  programInvolved: string | null;
  readable: string;
};

function shorten(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function detectProgramType(instructions: unknown[]): { type: ParsedTx["type"]; program: string | null } {
  const programIds = new Set<string>();
  for (const ix of instructions) {
    const programId = (ix as { programId?: string })?.programId;
    if (programId) programIds.add(programId);
  }

  if (programIds.has(TOKEN_PROGRAM) || programIds.has(TOKEN_2022_PROGRAM)) {
    return { type: "token-transfer", program: TOKEN_PROGRAM };
  }
  if (programIds.has(SYSTEM_PROGRAM)) {
    return { type: "sol-transfer", program: SYSTEM_PROGRAM };
  }
  if (programIds.size > 1) {
    return { type: "swap", program: Array.from(programIds)[0] };
  }
  if (programIds.size === 1) {
    return { type: "contract", program: Array.from(programIds)[0] };
  }
  return { type: "unknown", program: null };
}

async function parseTransaction(signature: string, raw: RawTx, walletAddress?: string): Promise<ParsedTx> {
  try {
    const tx = await rpcCall("getTransaction", [
      signature,
      { encoding: "jsonParsed", maxSupportedTransactionVersion: 0, commitment: "confirmed" },
    ]);

    const meta = tx?.meta;
    const blockTime = tx?.blockTime ?? raw.blockTime ?? null;
    const status: ParsedTx["status"] = meta?.err || raw.err ? "failed" : "success";
    const feeLamports = meta?.fee ?? null;
    const feeSol = feeLamports != null ? feeLamports / 1_000_000_000 : null;

    const message = tx?.transaction?.message;
    const instructions = message?.instructions || [];
    const { type, program } = detectProgramType(instructions);

    let from: string | null = null;
    let to: string | null = null;
    let amountSol: number | null = null;
    let tokenAmount: number | null = null;
    let tokenSymbol: string | null = null;

    // Try to parse system transfer
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
      if (parsed?.type === "transferChecked" || parsed?.type === "transfer") {
        const info = (parsed.info || {}) as ParsedInfo;
        if (typeof info.tokenAmount?.uiAmount === "number") {
          tokenAmount = info.tokenAmount.uiAmount;
          tokenSymbol = info.tokenAmount.symbol || null;
          from = String(info.authority || info.source || "");
          to = String(info.destination || "");
        } else if (typeof info.amount === "number" && info.tokenAmount?.decimals) {
          tokenAmount = info.amount / Math.pow(10, info.tokenAmount.decimals);
          from = String(info.authority || info.source || "");
          to = String(info.destination || "");
        }
      }
    }

    // Fallback: derive SOL change from pre/post balances if wallet provided
    if (walletAddress && amountSol == null && meta) {
      const accountKeys = message?.accountKeys || [];
      const index = accountKeys.findIndex((a: { pubkey?: string }) => a.pubkey === walletAddress);
      if (index >= 0 && meta.preBalances && meta.postBalances) {
        const delta = (meta.postBalances[index] - meta.preBalances[index]) / 1_000_000_000;
        if (Math.abs(delta) > 0.000001) {
          amountSol = delta;
        }
      }
    }

    const readable = type === "sol-transfer" && amountSol != null
      ? `${amountSol >= 0 ? "+" : ""}${amountSol.toFixed(6)} SOL`
      : type === "token-transfer" && tokenAmount != null
      ? `${tokenAmount >= 0 ? "+" : ""}${tokenAmount.toLocaleString()} ${tokenSymbol || "tokens"}`
      : type === "swap"
      ? "Swap"
      : type === "contract"
      ? "Contract call"
      : "Transaction";

    return {
      signature,
      timestamp: blockTime ? blockTime * 1000 : null,
      status,
      feeSol,
      type,
      from: from ? shorten(from) : null,
      to: to ? shorten(to) : null,
      amountSol,
      tokenAmount,
      tokenSymbol,
      programInvolved: program,
      readable,
    };
  } catch {
    return {
      signature,
      timestamp: raw.blockTime ? raw.blockTime * 1000 : null,
      status: raw.err ? "failed" : "success",
      feeSol: null,
      type: "unknown",
      from: null,
      to: null,
      amountSol: null,
      tokenAmount: null,
      tokenSymbol: null,
      programInvolved: null,
      readable: "Transaction",
    };
  }
}

async function fetchRecentTransactions(address: string, walletAddress?: string): Promise<ParsedTx[]> {
  const signatures = await fetchSignatures(address);
  const parsed = await Promise.all(
    signatures.map((raw) => parseTransaction(raw.signature, raw, walletAddress))
  );
  return parsed;
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(timestamp: number | null): string {
  if (!timestamp) return "Unknown";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function GET() {
  const { tokenCa, projectName, creatorWallet, foundationWallet } = getSettings();
  const solPrice = await fetchSolPrice();

  const token = await fetchTokenData(tokenCa, projectName);

  const foundationBalance = foundationWallet ? await fetchSolBalance(foundationWallet) : null;
  const creatorBalance = creatorWallet ? await fetchSolBalance(creatorWallet) : null;
  const devClaimable = creatorWallet && tokenCa ? await fetchDevClaimable(creatorWallet, tokenCa) : null;

  const [foundationTx, creatorTx, tokenTx] = await Promise.all([
    foundationWallet ? fetchRecentTransactions(foundationWallet, foundationWallet) : [],
    creatorWallet ? fetchRecentTransactions(creatorWallet, creatorWallet) : [],
    tokenCa ? fetchRecentTransactions(tokenCa) : [],
  ]);

  const foundationSolValue = foundationBalance != null && solPrice != null
    ? foundationBalance * solPrice
    : null;
  const creatorSolValue = creatorBalance != null && solPrice != null
    ? creatorBalance * solPrice
    : null;
  const devClaimableUsd = devClaimable != null && solPrice != null
    ? devClaimable * solPrice
    : null;

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    solPrice,
    token,
    wallets: {
      foundation: {
        address: foundationWallet,
        solBalance: foundationBalance,
        solValueUsd: foundationSolValue,
        recentTx: foundationTx.map((tx) => ({
          ...tx,
          formattedDate: formatDate(tx.timestamp),
          timeAgo: timeAgo(tx.timestamp),
          solscanUrl: `https://solscan.io/tx/${tx.signature}`,
        })),
      },
      creator: {
        address: creatorWallet,
        solBalance: creatorBalance,
        solValueUsd: creatorSolValue,
        devClaimableSol: devClaimable,
        devClaimableUsd,
        recentTx: creatorTx.map((tx) => ({
          ...tx,
          formattedDate: formatDate(tx.timestamp),
          timeAgo: timeAgo(tx.timestamp),
          solscanUrl: `https://solscan.io/tx/${tx.signature}`,
        })),
      },
    },
    tokenRecentTx: tokenTx.map((tx) => ({
      ...tx,
      formattedDate: formatDate(tx.timestamp),
      timeAgo: timeAgo(tx.timestamp),
      solscanUrl: `https://solscan.io/tx/${tx.signature}`,
    })),
  });
}
