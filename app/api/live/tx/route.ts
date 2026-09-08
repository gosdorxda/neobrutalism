import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { getSolPrice } from "@/lib/cache";
import { HELIUS_RPC_BASE, HELIUS_TX_API_BASE, LAMPORTS_PER_SOL } from "@/lib/constants";

export const dynamic = "force-dynamic";

const seenSigs = new Set<string>();
const MAX_SEEN = 200;

const SOL_MINT = "So11111111111111111111111111111111111111112";

type AccountData = {
  account?: string;
  nativeBalanceChange?: number;
  tokenBalanceChanges?: { userAccount?: string; mint?: string; rawTokenAmount?: { tokenAmount?: string; decimals?: number } }[];
};

type ParsedTx = {
  feePayer?: string;
  events?: { swap?: { tokenInputs?: { mint?: string; amount?: string | number; decimals?: number }[]; tokenOutputs?: { mint?: string; amount?: string | number; decimals?: number }[] } | null } | null;
  nativeTransfers?: { fromUserAccount?: string; toUserAccount?: string; amount?: number }[];
  tokenTransfers?: { mint?: string; tokenAmount?: number; decimals?: number; fromUserAccount?: string; toUserAccount?: string }[];
  accountData?: AccountData[];
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("raw") === "1";
  const settings = getSettings();
  const tokenMint = settings.tokenCa?.trim();
  if (!tokenMint) return NextResponse.json({ txs: [] });

  const key = process.env.HELIUS_API_KEY?.trim();
  if (!key) return NextResponse.json({ txs: [], error: "Helius not configured" });

  const rpcUrl = `${HELIUS_RPC_BASE}${key}`;

  let sigRes;
  try {
    const r = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [tokenMint, { limit: 10 }],
      }),
      cache: "no-store",
    });
    sigRes = await r.json();
  } catch {
    return NextResponse.json({ txs: [], error: "RPC error" });
  }

  const sigs = sigRes?.result || [];
  if (sigs.length === 0) return NextResponse.json({ txs: [] });

  // Raw mode: parse latest sigs directly (skip dedup)
  if (raw) {
    const rawSigs: string[] = sigs.slice(0, 3).map((s: { signature?: string }) => s.signature).filter((s: string | undefined): s is string => Boolean(s));
    let rawParsed: ParsedTx[] = [];
    try {
      const r = await fetch(`${HELIUS_TX_API_BASE}${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: rawSigs }),
        cache: "no-store",
      });
      if (r.ok) rawParsed = await r.json();
    } catch {
      // ignore
    }
    return NextResponse.json({ parsed: rawParsed, tokenMint });
  }

  const newSigs: string[] = [];
  for (const s of sigs) {
    const sig: string = s.signature;
    if (!seenSigs.has(sig)) newSigs.push(sig);
    seenSigs.add(sig);
  }
  if (seenSigs.size > MAX_SEEN) {
    const arr = Array.from(seenSigs).slice(-MAX_SEEN);
    seenSigs.clear();
    arr.forEach((s) => seenSigs.add(s));
  }

  if (newSigs.length === 0) return NextResponse.json({ txs: [] });

  const sigsToParse = newSigs.slice(0, 5);
  let parsed: ParsedTx[] = [];
  try {
    const r = await fetch(`${HELIUS_TX_API_BASE}${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions: sigsToParse }),
      cache: "no-store",
    });
    if (r.ok) parsed = await r.json();
  } catch {
    // ignore
  }

  const solPrice = (await getSolPrice()) ?? 0;

  if (raw) {
    return NextResponse.json({ parsed, tokenMint, solPrice });
  }

  const txs: { side: "buy" | "sell"; wallet: string; sol: number; usd: number; tokenAmount: number }[] = [];

  for (const tx of parsed) {
    const fp = tx.feePayer;
    if (!fp) continue;

    let side: "buy" | "sell" | null = null;
    let solAmount = 0;
    let tokenAmount = 0;

    // 1. Try swap event (Jupiter/standard DEX)
    const swap = tx.events?.swap;
    if (swap) {
      const tokenIn = (swap.tokenInputs || []).find((t) => t.mint === tokenMint);
      const tokenOut = (swap.tokenOutputs || []).find((t) => t.mint === tokenMint);
      if (tokenOut && !tokenIn) side = "buy";
      else if (tokenIn && !tokenOut) side = "sell";
    }

    // 2. Pump.fun AMM: use accountData (nativeBalanceChange) + tokenTransfers
    // Buy = fp nativeBalanceChange negative (SOL out) + token mint in
    // Sell = fp nativeBalanceChange positive (SOL in) + token mint out
    if (!side && tx.accountData) {
      const fpData = tx.accountData.find((a) => a.account === fp);
      if (fpData) {
        const nativeChange = fpData.nativeBalanceChange || 0;
        let tokenOut = 0;
        let tokenIn = 0;

        for (const tt of tx.tokenTransfers || []) {
          if (tt.mint !== tokenMint || tt.tokenAmount == null) continue;
          const amt = tt.tokenAmount / Math.pow(10, tt.decimals || 0);
          if (tt.fromUserAccount === fp && amt > tokenOut) tokenOut = amt;
          if (tt.toUserAccount === fp && amt > tokenIn) tokenIn = amt;
        }

        if (nativeChange < 0 && tokenIn > 0) {
          side = "buy";
          solAmount = Math.abs(nativeChange) / LAMPORTS_PER_SOL;
          tokenAmount = tokenIn;
        } else if (nativeChange > 0 && tokenOut > 0) {
          side = "sell";
          solAmount = nativeChange / LAMPORTS_PER_SOL;
          tokenAmount = tokenOut;
        }
      }
    }

    // 3. Fallback: nativeTransfers + tokenTransfers direction
    if (!side) {
      let tokenOut = 0;
      let tokenIn = 0;
      let solOut = 0;
      let solIn = 0;

      for (const tt of tx.tokenTransfers || []) {
        if (tt.mint === SOL_MINT && tt.tokenAmount != null) {
          const amt = tt.tokenAmount / Math.pow(10, tt.decimals || 9);
          if (tt.fromUserAccount === fp && amt > solOut) solOut = amt;
          if (tt.toUserAccount === fp && amt > solIn) solIn = amt;
        }
        if (tt.mint !== tokenMint || tt.tokenAmount == null) continue;
        const amt = tt.tokenAmount / Math.pow(10, tt.decimals || 0);
        if (tt.fromUserAccount === fp && amt > tokenOut) tokenOut = amt;
        if (tt.toUserAccount === fp && amt > tokenIn) tokenIn = amt;
      }

      for (const nt of tx.nativeTransfers || []) {
        const amt = (nt.amount || 0) / LAMPORTS_PER_SOL;
        if (nt.fromUserAccount === fp && amt > solOut) solOut = amt;
        if (nt.toUserAccount === fp && amt > solIn) solIn = amt;
      }

      if (tokenOut > tokenIn && (solIn > 0 || solOut === 0)) {
        side = "sell";
        solAmount = solIn || solOut;
        tokenAmount = tokenOut;
      } else if (tokenIn > tokenOut && (solOut > 0 || solIn === 0)) {
        side = "buy";
        solAmount = solOut || solIn;
        tokenAmount = tokenIn;
      }
    }

    if (!side) continue;

    // Get token amount from tokenTransfers if not set
    if (tokenAmount === 0) {
      for (const tt of tx.tokenTransfers || []) {
        if (tt.mint !== tokenMint || tt.tokenAmount == null) continue;
        const amt = tt.tokenAmount / Math.pow(10, tt.decimals || 0);
        if (side === "buy" && tt.toUserAccount === fp && amt > tokenAmount) tokenAmount = amt;
        if (side === "sell" && tt.fromUserAccount === fp && amt > tokenAmount) tokenAmount = amt;
      }
    }

    // Get SOL amount from nativeTransfers if still 0
    if (solAmount === 0 && tx.nativeTransfers) {
      let maxIn = 0;
      let maxOut = 0;
      for (const nt of tx.nativeTransfers) {
        const amt = (nt.amount || 0) / LAMPORTS_PER_SOL;
        if (nt.toUserAccount === fp && amt > maxIn) maxIn = amt;
        if (nt.fromUserAccount === fp && amt > maxOut) maxOut = amt;
      }
      if (side === "buy") solAmount = maxOut || maxIn;
      else if (side === "sell") solAmount = maxIn || maxOut;
    }

    const usd = solAmount * solPrice;
    txs.push({
      side,
      wallet: fp.slice(0, 4) + "..." + fp.slice(-4),
      sol: Math.round(solAmount * 1000) / 1000,
      usd: Math.round(usd * 100) / 100,
      tokenAmount: Math.round(tokenAmount * 1000000) / 1000000,
    });
  }

  return NextResponse.json({ txs });
}
