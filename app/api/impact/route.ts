import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { getWalletTokenImpact } from "@/lib/helius";
import { getSolPrice } from "@/lib/cache";
import { CREATOR_FEE_BPS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet")?.trim();
  if (!wallet) {
    return NextResponse.json({ error: "Wallet address required." }, { status: 400 });
  }
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return NextResponse.json({ error: "Invalid Solana wallet address." }, { status: 400 });
  }

  const settings = getSettings();
  const tokenMint = settings.tokenCa?.trim();
  if (!tokenMint) {
    return NextResponse.json({ error: "Token not configured." }, { status: 500 });
  }

  try {
    const impact = await getWalletTokenImpact(wallet, tokenMint);
    const solPrice = (await getSolPrice()) ?? 0;
    const volumeUsd = impact.volumeUsd * solPrice;
    const feeUsd = volumeUsd * (CREATOR_FEE_BPS / 10000);
    const base = {
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
    if (request.nextUrl.searchParams.get("debug") === "1") {
      return NextResponse.json({
        ...base,
        debug: {
          tokenMint,
          ataFound: impact.txCount > 0,
          eventTypes: impact.eventTypes,
          sampleEvents: impact.sampleEvents,
          sampleKeys: impact.sampleKeys,
          sampleTokenTransfers: impact.sampleTokenTransfers,
        },
      });
    }
    return NextResponse.json(base);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to compute impact.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
