import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { getSolPrice } from "@/lib/cache";
import { HELIUS_RPC_BASE, HELIUS_TX_API_BASE, LAMPORTS_PER_SOL } from "@/lib/constants";

export const dynamic = "force-dynamic";

const seenSigs = new Set<string>();
const MAX_SEEN = 200;

type ParsedTx = {
  feePayer?: string;
  events?: { swap?: { tokenInputs?: { mint?: string; amount?: string | number; decimals?: number }[]; tokenOutputs?: { mint?: string; amount?: string | number; decimals?: number }[] } | null } | null;
  nativeTransfers?: { fromUserAccount?: string; toUserAccount?: string; amount?: number }[];
  tokenTransfers?: { mint?: string; tokenAmount?: number; decimals?: number }[];
};

export async function GET() {
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
  const txs: { side: "buy" | "sell"; wallet: string; sol: number; usd: number; tokenAmount: number }[] = [];

  for (const tx of parsed) {
    const fp = tx.feePayer;
    if (!fp) continue;

    let side: "buy" | "sell" | null = null;
    let solAmount = 0;

    const swap = tx.events?.swap;
    if (swap) {
      const tokenIn = (swap.tokenInputs || []).find((t) => t.mint === tokenMint);
      const tokenOut = (swap.tokenOutputs || []).find((t) => t.mint === tokenMint);
      if (tokenOut && !tokenIn) side = "buy";
      else if (tokenIn && !tokenOut) side = "sell";
    }

    if (!side && tx.nativeTransfers) {
      let outSol = 0;
      let inSol = 0;
      for (const nt of tx.nativeTransfers) {
        const amt = (nt.amount || 0) / LAMPORTS_PER_SOL;
        if (nt.fromUserAccount === fp && amt > outSol) outSol = amt;
        else if (nt.toUserAccount === fp && amt > inSol) inSol = amt;
      }
      if (outSol > inSol && outSol > 0) { side = "buy"; solAmount = outSol; }
      else if (inSol > 0) { side = "sell"; solAmount = inSol; }
    }

    if (!side) continue;

    if (solAmount === 0) {
      for (const nt of tx.nativeTransfers || []) {
        const amt = (nt.amount || 0) / LAMPORTS_PER_SOL;
        if (side === "buy" && nt.fromUserAccount === fp && amt > solAmount) solAmount = amt;
        if (side === "sell" && nt.toUserAccount === fp && amt > solAmount) solAmount = amt;
      }
    }

    const usd = solAmount * solPrice;
    let tokenAmount = 0;
    if (swap) {
      const entry = (side === "buy" ? (swap.tokenOutputs || []) : (swap.tokenInputs || [])).find((t) => t.mint === tokenMint);
      if (entry && entry.amount != null && entry.decimals != null) {
        tokenAmount = Number(entry.amount) / Math.pow(10, entry.decimals);
      }
    }
    if (tokenAmount === 0 && tx.tokenTransfers) {
      for (const tt of tx.tokenTransfers) {
        if (tt.mint === tokenMint && tt.tokenAmount != null) {
          tokenAmount = tt.tokenAmount / Math.pow(10, tt.decimals || 0);
          break;
        }
      }
    }
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
