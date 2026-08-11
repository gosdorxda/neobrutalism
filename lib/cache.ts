import { redis, isRedisEnabled } from "./redis";
import { getStats as getLocalStats } from "./data";
import { getSettings } from "./settings";

const SOL_PRICE_KEY = "sol:price";
const STATS_KEY = "stats:summary";
const TOKEN_KEY = "token:info";

const SOL_PRICE_TTL = 60; // seconds
const STATS_TTL = 60; // seconds
const TOKEN_TTL = 30; // seconds

const COINGECKO_SOL_URL = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";
const PUMPFUN_SUPPLY = 1_000_000_000;

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
  athMarketCap: string | null;
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

async function fetchFreshTokenInfo(): Promise<CachedTokenInfo | null> {
  const settings = getSettings();
  const tokenCa = settings.tokenCa || process.env.NEXT_PUBLIC_TOKEN_CA || "CATFUNDeio111111111111111111111111111111111";
  const projectName = settings.projectName || "CATFUND";

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
      symbol: data.ticker || projectName,
      price: priceUsd ? `$${priceUsd.toFixed(10)}` : null,
      marketCap: marketCap ? `$${marketCap.toLocaleString("en-US")}` : null,
      volume: volume ? `$${volume.toLocaleString("en-US")}` : null,
      holders: holders ? holders.toLocaleString("en-US") : null,
      totalTx: formatNumber(data.transactions ? Number(data.transactions) : null),
      buyTx: formatNumber(data.buy_transactions ? Number(data.buy_transactions) : null),
      sellTx: formatNumber(data.sell_transactions ? Number(data.sell_transactions) : null),
      snipers: formatNumber(data.sniper_count ? Number(data.sniper_count) : null),
      athMarketCap: data.ath_market_cap ? `$${Number(data.ath_market_cap).toLocaleString("en-US")}` : null,
      devHolding: data.bundler_owned_percentage_v2
        ? `${(Number(data.bundler_owned_percentage_v2) * 100).toFixed(2)}%`
        : "0.00%",
      imageUrl: data.imageUrl || null,
      buyUrl: `https://pump.fun/coin/${tokenCa}`,
    };
  } catch {
    return null;
  }
}

export async function getTokenInfo(): Promise<CachedTokenInfo> {
  const cached = await getFromCache<CachedTokenInfo>(TOKEN_KEY);
  if (cached !== null) return cached;

  const settings = getSettings();
  const tokenCa = settings.tokenCa || process.env.NEXT_PUBLIC_TOKEN_CA || "CATFUNDeio111111111111111111111111111111111";
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
      athMarketCap: null,
      devHolding: "0.00%",
      imageUrl: null,
      buyUrl: `https://pump.fun/coin/${tokenCa}`,
    };

  await setCache(TOKEN_KEY, result, TOKEN_TTL);
  return result;
}

// Wallet caching
const WALLETS_KEY = "wallets:summary";
const WALLETS_TTL = 60; // seconds

const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export type CachedWallet = {
  address: string;
  solBalance: number | null;
  solValueUsd: number | null;
  devClaimableSol?: number | null;
  devClaimableUsd?: number | null;
};

export type CachedWallets = {
  foundation: CachedWallet | null;
  creator: CachedWallet | null;
};

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

async function fetchWalletSolBalance(wallet: string): Promise<number | null> {
  try {
    const result = await rpcCall("getBalance", [wallet]);
    const lamports = result?.value;
    return typeof lamports === "number" ? lamports / 1_000_000_000 : null;
  } catch {
    return null;
  }
}

async function fetchWalletDevClaimable(wallet: string, mint: string): Promise<number | null> {
  try {
    const url = `https://pumpdev.io/api/claim-account?publicKey=${encodeURIComponent(wallet)}&mint=${encodeURIComponent(mint)}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return typeof data?.totalClaimable === "number" ? data.totalClaimable : null;
  } catch {
    return null;
  }
}

async function fetchFreshWallets(): Promise<CachedWallets | null> {
  const settings = getSettings();
  const { creatorWallet, foundationWallet, tokenCa } = settings;

  if (!creatorWallet && !foundationWallet) return null;

  const [foundationBalance, creatorBalance, devClaimable, solPrice] = await Promise.all([
    foundationWallet ? fetchWalletSolBalance(foundationWallet) : Promise.resolve(null),
    creatorWallet ? fetchWalletSolBalance(creatorWallet) : Promise.resolve(null),
    creatorWallet && tokenCa ? fetchWalletDevClaimable(creatorWallet, tokenCa) : Promise.resolve(null),
    getSolPrice(),
  ]);

  return {
    foundation: foundationWallet
      ? {
          address: foundationWallet,
          solBalance: foundationBalance,
          solValueUsd:
            foundationBalance != null && solPrice != null ? foundationBalance * solPrice : null,
        }
      : null,
    creator: creatorWallet
      ? {
          address: creatorWallet,
          solBalance: creatorBalance,
          solValueUsd:
            creatorBalance != null && solPrice != null ? creatorBalance * solPrice : null,
          devClaimableSol: devClaimable,
          devClaimableUsd:
            devClaimable != null && solPrice != null ? devClaimable * solPrice : null,
        }
      : null,
  };
}

export async function getWallets(): Promise<CachedWallets> {
  const cached = await getFromCache<CachedWallets>(WALLETS_KEY);
  if (cached !== null) return cached;

  const settings = getSettings();
  const { creatorWallet, foundationWallet } = settings;

  const fresh = await fetchFreshWallets();
  const result = fresh ?? {
    foundation: foundationWallet
      ? { address: foundationWallet, solBalance: null, solValueUsd: null }
      : null,
    creator: creatorWallet
      ? { address: creatorWallet, solBalance: null, solValueUsd: null, devClaimableSol: null, devClaimableUsd: null }
      : null,
  };

  await setCache(WALLETS_KEY, result, WALLETS_TTL);
  return result;
}
