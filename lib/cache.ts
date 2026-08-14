import { redis, isRedisEnabled } from "./redis";
import { getStats as getLocalStats } from "./data";
import { getSettings } from "./settings";

const SOL_PRICE_KEY = "sol:price";
const STATS_KEY = "stats:summary";
const TOKEN_KEY = "token:info";

const SOL_PRICE_TTL = 60; // seconds
const STATS_TTL = 60; // seconds
const TOKEN_TTL = 900; // seconds (15 minutes) - SolanaTracker free tier: 2500 req/month

const COINGECKO_SOL_URL = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

export type CachedStats = {
  totalCats: number;
  totalFees: number;
  totalFeesCumulative: number;
  totalFeesSol: number;
  totalFood: number;
  feedingRounds: number;
  estimatedBowls: number;
};

export type CachedTokenInfo = {
  ca: string;
  name: string;
  symbol: string;
  price: string | null;
  marketCap: string | null;
  volume: string | null;
  holders: string | null;
  totalTx: string | null;
  buyTx: string | null;
  sellTx: string | null;
  snipers: string | null;
  insiders: string | null;
  devHolding: string;
  imageUrl: string | null;
  buyUrl: string;
};

async function getFromCache<T>(key: string): Promise<T | null> {
  if (!isRedisEnabled() || !redis) return null;
  try {
    const value = await redis.get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, value: T, ttl: number) {
  if (!isRedisEnabled() || !redis) return;
  try {
    await redis.setex(key, ttl, value);
  } catch {
    // ignore
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

async function fetchFreshSolPrice(): Promise<number | null> {
  return (await fetchCoinGeckoSolPrice()) ?? (await fetchBinanceSolPrice());
}

export async function getSolPrice(): Promise<number | null> {
  const cached = await getFromCache<number>(SOL_PRICE_KEY);
  if (cached !== null) return cached;

  const fresh = await fetchFreshSolPrice();
  if (fresh !== null) {
    await setCache(SOL_PRICE_KEY, fresh, SOL_PRICE_TTL);
  }
  return fresh;
}

async function fetchSolBalance(wallet: string): Promise<number | null> {
  const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
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

async function fetchFreshStats(): Promise<CachedStats | null> {
  const settings = getSettings();
  const { creatorWallet, tokenCa } = settings;
  const localStats = getLocalStats();

  let result: CachedStats = {
    ...localStats,
    totalFeesSol: 0,
    totalFeesCumulative: localStats.totalFees,
    estimatedBowls: 0,
  };

  if (creatorWallet && tokenCa) {
    const claimable = await fetchPumpDevClaimable(creatorWallet, tokenCa);
    if (claimable !== null) {
      const solPrice = await getSolPrice();
      const totalFeesUsd = solPrice ? claimable * solPrice : claimable;
      const bowlsAndCats = Math.floor(totalFeesUsd);
      result = {
        ...localStats,
        totalFees: totalFeesUsd,
        totalFeesSol: claimable,
        totalFeesCumulative: localStats.totalFees,
        feedingRounds: bowlsAndCats,
        estimatedBowls: bowlsAndCats,
      };
    }
  } else if (creatorWallet) {
    const balance = await fetchSolBalance(creatorWallet);
    if (balance !== null) {
      result = {
        ...localStats,
        totalFees: balance,
        totalFeesSol: balance,
        totalFeesCumulative: localStats.totalFees,
        estimatedBowls: 0,
      };
    }
  }

  return result;
}

export async function getStats(): Promise<CachedStats> {
  const cached = await getFromCache<CachedStats>(STATS_KEY);
  if (cached !== null) return cached;

  const fresh = await fetchFreshStats();
  const result = fresh ?? {
    ...getLocalStats(),
    totalFeesSol: 0,
    totalFeesCumulative: getLocalStats().totalFees,
    estimatedBowls: 0,
  };
  await setCache(STATS_KEY, result, STATS_TTL);
  return result;
}

function formatNumber(value: number | null): string | null {
  if (value === null || isNaN(value)) return null;
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPrice(value: number): string {
  if (value === 0) return "0";
  if (value >= 1) return value.toFixed(4);
  if (value >= 0.0001) return value.toFixed(8).replace(/\.?0+$/, "");
  return value.toExponential(4);
}

async function fetchFreshTokenInfo(): Promise<CachedTokenInfo | null> {
  const settings = getSettings();
  const tokenCa = settings.tokenCa || process.env.NEXT_PUBLIC_TOKEN_CA || "CATFUNDeio111111111111111111111111111111111";
  const projectName = settings.projectName || "CATFUND";
  const apiKey = process.env.SOLANA_TRACKER_API_KEY || "208b2ae4-7ab1-48b1-86b2-76ccfc163f91";

  try {
    const res = await fetch(
      `https://data.solanatracker.io/tokens/${tokenCa}`,
      {
        headers: { "x-api-key": apiKey },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`SolanaTracker ${res.status}`);
    const data = await res.json();

    const pools = data?.pools;
    const bestPool = Array.isArray(pools) && pools.length > 0
      ? pools.reduce((best: { liquidity?: { usd?: number } }, current: { liquidity?: { usd?: number } }) => {
          const bestLiquidity = best.liquidity?.usd ?? 0;
          const currentLiquidity = current.liquidity?.usd ?? 0;
          return currentLiquidity > bestLiquidity ? current : best;
        }, pools[0])
      : null;

    const priceUsd = bestPool?.price?.usd ? Number(bestPool.price.usd) : null;
    const marketCap = bestPool?.marketCap?.usd ? Number(bestPool.marketCap.usd) : null;
    const volume = bestPool?.txns?.volume24h ? Number(bestPool.txns.volume24h) : null;
    const poolTxns = bestPool?.txns;

    return {
      ca: tokenCa,
      name: data.token?.name || projectName,
      symbol: data.token?.symbol || projectName,
      price: priceUsd ? `$${formatPrice(priceUsd)}` : null,
      marketCap: marketCap ? `$${marketCap.toLocaleString("en-US")}` : null,
      volume: volume ? `$${volume.toLocaleString("en-US")}` : null,
      holders: data.holders != null ? formatNumber(Number(data.holders)) : null,
      totalTx: data.txns != null ? formatNumber(Number(data.txns)) : poolTxns != null ? formatNumber(poolTxns.total) : null,
      buyTx: data.buys != null ? formatNumber(Number(data.buys)) : poolTxns != null ? formatNumber(poolTxns.buys) : null,
      sellTx: data.sells != null ? formatNumber(Number(data.sells)) : poolTxns != null ? formatNumber(poolTxns.sells) : null,
      snipers: data.risk?.snipers?.count != null ? formatNumber(Number(data.risk.snipers.count)) : null,
      insiders: data.risk?.insiders?.count != null ? formatNumber(Number(data.risk.insiders.count)) : null,
      devHolding: data.risk?.dev?.percentage != null
        ? `${Number(data.risk.dev.percentage).toFixed(2)}%`
        : "0.00%",
      imageUrl: data.token?.image || null,
      buyUrl: `https://pump.fun/coin/${tokenCa}`,
    };
  } catch {
    return null;
  }
}

export async function getTokenInfo(): Promise<CachedTokenInfo> {
  const settings = getSettings();
  const tokenCa = settings.tokenCa || process.env.NEXT_PUBLIC_TOKEN_CA || "CATFUNDeio111111111111111111111111111111111";
  const cacheKey = `${TOKEN_KEY}:${tokenCa}`;
  
  console.log("[getTokenInfo] tokenCa:", tokenCa, "cacheKey:", cacheKey);
  
  const cached = await getFromCache<CachedTokenInfo>(cacheKey);
  if (cached !== null) return cached;

  const projectName = settings.projectName || "CATFUND";

  const fresh = await fetchFreshTokenInfo();
  const result =
    fresh ?? {
      ca: tokenCa,
      name: projectName,
      symbol: "CAT",
      price: null,
      marketCap: null,
      volume: null,
      holders: null,
      totalTx: null,
      buyTx: null,
      sellTx: null,
      snipers: null,
      insiders: null,
      devHolding: "0.00%",
      imageUrl: null,
      buyUrl: `https://pump.fun/coin/${tokenCa}`,
    };

  await setCache(cacheKey, result, TOKEN_TTL);
  return result;
}
