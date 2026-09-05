import { HELIUS_RPC_BASE, HELIUS_TX_API_BASE, DEFAULT_RPC, CREATOR_FEE_BPS } from "./constants";
import { getSolPrice } from "./cache";

export type ImpactData = {
  wallet: string;
  volumeUsd: number;
  feeUsd: number;
  cats: number;
  foodKg: number;
  buyCount: number;
  sellCount: number;
  txCount: number;
  feeBps: number;
};

export async function computeImpact(
  wallet: string,
  tokenMint: string
): Promise<ImpactData> {
  const impact = await getWalletTokenImpact(wallet, tokenMint);
  const solPrice = (await getSolPrice()) ?? 0;
  const volumeUsd = impact.volumeUsd * solPrice;
  const feeUsd = volumeUsd * (CREATOR_FEE_BPS / 10000);
  return {
    wallet,
    volumeUsd,
    feeUsd,
    cats: Math.floor(feeUsd),
    foodKg: feeUsd / 5,
    buyCount: impact.buyCount,
    sellCount: impact.sellCount,
    txCount: impact.txCount,
    feeBps: CREATOR_FEE_BPS,
  };
}

function heliusKey(): string | null {
  const k = process.env.HELIUS_API_KEY?.trim();
  return k || null;
}

async function rpcRequest(method: string, params: unknown[]) {
  const key = heliusKey();
  const url = key ? `${HELIUS_RPC_BASE}${key}` : DEFAULT_RPC;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  return res.json();
}

type TokenEntry = {
  mint?: string;
  amount?: string | number;
  decimals?: number;
  priceInfo?: { usd?: number | null; pricePerToken?: number | null };
};

type ParsedTx = {
  events?: { swap?: { tokenInputs?: TokenEntry[]; tokenOutputs?: TokenEntry[] } | null } | null;
  nativeTransfers?: {
    fromUserAccount?: string | null;
    toUserAccount?: string | null;
    amount?: number;
  }[];
};

function tokenUsd(token: TokenEntry | undefined): number {
  if (!token) return 0;
  if (token.priceInfo?.usd != null) return token.priceInfo.usd;
  if (token.priceInfo?.pricePerToken != null && token.amount != null && token.decimals) {
    const amt = Number(token.amount) / Math.pow(10, token.decimals);
    return amt * token.priceInfo.pricePerToken;
  }
  return 0;
}

export async function getWalletTokenImpact(
  wallet: string,
  tokenMint: string
): Promise<{
  volumeUsd: number;
  buyCount: number;
  sellCount: number;
  txCount: number;
  eventTypes: string[];
  sampleEvents: unknown;
  sampleKeys: string[];
  sampleTokenTransfers: unknown;
}> {
  const result = { volumeUsd: 0, buyCount: 0, sellCount: 0, txCount: 0, eventTypes: [] as string[], sampleEvents: null as unknown, sampleKeys: [] as string[], sampleTokenTransfers: null as unknown };
  const key = heliusKey();
  if (!key) throw new Error("Helius not configured (HELIUS_API_KEY missing).");

  // 1. find wallet's ATA for the token
  const ataRes = await rpcRequest("getTokenAccountsByOwner", [
    wallet,
    { mint: tokenMint },
    { encoding: "jsonParsed" },
  ]);
  const ata = ataRes?.result?.value?.[0]?.pubkey;
  if (!ata) return result; // wallet never held the token

  // 2. get signatures touching the ATA (last 100)
  const sigRes = await rpcRequest("getSignaturesForAddress", [ata, { limit: 100 }]);
  const sigs: string[] = (sigRes?.result || [])
    .map((s: { signature?: string }) => s.signature)
    .filter((s: string | undefined): s is string => Boolean(s));
  if (sigs.length === 0) return result;

  // 3. parse transactions via Helius enhanced API
  const parseRes = await fetch(`${HELIUS_TX_API_BASE}${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions: sigs }),
    cache: "no-store",
  });
  if (!parseRes.ok) return result;
  const parsed: ParsedTx[] = await parseRes.json();

  result.txCount = parsed.length;
  const eventTypes = new Set<string>();
  let solIn = 0;
  let solOut = 0;

  for (const tx of parsed) {
    if (tx.events) {
      for (const k of Object.keys(tx.events)) eventTypes.add(k);
    }
    if (!result.sampleEvents && tx.events) {
      result.sampleEvents = tx.events;
    }
    if (result.sampleKeys.length === 0 && tx) {
      result.sampleKeys = Object.keys(tx);
      result.sampleTokenTransfers = (tx as { tokenTransfers?: unknown }).tokenTransfers ?? null;
    }
    for (const nt of tx.nativeTransfers || []) {
      const amt = (nt.amount || 0) / 1_000_000_000;
      if (nt.fromUserAccount === wallet) {
        solOut += amt;
        result.buyCount += 1;
      } else if (nt.toUserAccount === wallet) {
        solIn += amt;
        result.sellCount += 1;
      }
    }
  }

  result.eventTypes = Array.from(eventTypes);
  // store SOL volume in volumeUsd field temporarily (route multiplies by SOL price)
  result.volumeUsd = solIn + solOut;
  return result;
}
