import { NextResponse } from "next/server";
import { getStats } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import fs from "fs";
import path from "path";

const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const COINGECKO_SOL_URL = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

const CACHE_FILE = path.join(process.cwd(), "data", "stats-cache.json");
const CACHE_TTL_MS = 60 * 1000; // 1 minute
const REWARD_PER_BOWL = 1; // 1 bowl / 1 cat fed per 1 reward unit (USD)

type CachedStats = {
  timestamp: number;
  stats: {
    totalCats: number;
    totalFees: number;
    totalFeesSol: number;
    totalFood: number;
    feedingRounds: number;
  };
};

function readCache(): CachedStats | null {
  try {
    const data = fs.readFileSync(CACHE_FILE, "utf8");
    const parsed = JSON.parse(data) as CachedStats;
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeCache(stats: CachedStats["stats"]) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ timestamp: Date.now(), stats }, null, 2), "utf8");
  } catch {
    // ignore write errors
  }
}

async function fetchSolBalance(wallet: string): Promise<number | null> {
  try {
    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [wallet],
      }),
      next: { revalidate: 30 },
    });
    const data = await res.json();
    const lamports = data?.result?.value;
    if (typeof lamports === "number") {
      return lamports / 1_000_000_000;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchPumpDevClaimable(wallet: string, mint: string): Promise<number | null> {
  try {
    const url = `https://pumpdev.io/api/claim-account?publicKey=${encodeURIComponent(wallet)}&mint=${encodeURIComponent(mint)}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    if (typeof data?.totalClaimable === "number") {
      return data.totalClaimable;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchCoinGeckoSolPrice(): Promise<number | null> {
  try {
    const res = await fetch(COINGECKO_SOL_URL, { next: { revalidate: 60 } });
    const data = await res.json();
    const price = data?.solana?.usd;
    return typeof price === "number" ? price : null;
  } catch {
    return null;
  }
}

async function fetchBinanceSolPrice(): Promise<number | null> {
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

async function fetchSolPrice(): Promise<number | null> {
  return (await fetchCoinGeckoSolPrice()) ?? (await fetchBinanceSolPrice());
}

export async function GET() {
  const { creatorWallet, tokenCa } = getSettings();
  const usesExternalApi = Boolean(creatorWallet);

  if (usesExternalApi) {
    const cached = readCache();
    if (cached) {
      return NextResponse.json(cached.stats);
    }
  }

  const localStats = getStats();
  let result = {
    ...localStats,
    totalFeesSol: 0,
  };

  if (creatorWallet && tokenCa) {
    const claimable = await fetchPumpDevClaimable(creatorWallet, tokenCa);
    if (claimable !== null) {
      const solPrice = await fetchSolPrice();
      const totalFeesUsd = solPrice ? claimable * solPrice : claimable;
      const bowlsAndCats = Math.floor(totalFeesUsd / REWARD_PER_BOWL);
      result = {
        ...localStats,
        totalFees: totalFeesUsd,
        totalFeesSol: claimable,
        totalCats: bowlsAndCats,
        feedingRounds: bowlsAndCats,
      };
    }
  } else if (creatorWallet) {
    const balance = await fetchSolBalance(creatorWallet);
    if (balance !== null) {
      result = {
        ...localStats,
        totalFees: balance,
        totalFeesSol: balance,
      };
    }
  }

  if (usesExternalApi) {
    writeCache(result);
  }

  return NextResponse.json(result);
}
