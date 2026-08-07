import { getSettings } from "@/lib/settings";
import { NextResponse } from "next/server";

const PUMPFUN_SUPPLY = 1_000_000_000;

function formatUsd(value: number | null | undefined): string | null {
  if (!value || isNaN(value)) return null;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(8)}`;
}

function formatNumber(value: number | null | undefined): string | null {
  if (!value || isNaN(value)) return null;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString();
}

export async function GET() {
  const { tokenCa, projectName } = getSettings();
  const tokenSymbol = `$${projectName}`;

  try {
    const res = await fetch(
      `https://advanced-api-v2.pump.fun/coins/metadata/${tokenCa}`,
      {
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) {
      throw new Error(`PumpFun request failed: ${res.status}`);
    }

    const data = await res.json();

    const marketCap = data.marketcap ? Number(data.marketcap) : null;
    const priceUsd = marketCap ? marketCap / PUMPFUN_SUPPLY : null;
    const volume = data.volume_usd ? Number(data.volume_usd) : null;
    const holders = data.num_holders_v2
      ? Number(data.num_holders_v2)
      : data.num_holders
      ? Number(data.num_holders)
      : null;

    const totalTx = data.transactions ? Number(data.transactions) : null;
    const buyTx = data.buy_transactions ? Number(data.buy_transactions) : null;
    const sellTx = data.sell_transactions ? Number(data.sell_transactions) : null;
    const snipers = data.sniper_count ? Number(data.sniper_count) : null;
    const athMarketCap = data.ath_market_cap ? Number(data.ath_market_cap) : null;
    const devHolding = data.bundler_owned_percentage_v2
      ? Number(data.bundler_owned_percentage_v2)
      : 0;

    return NextResponse.json({
      ca: tokenCa,
      name: data.name || projectName,
      symbol: data.ticker ? `$${data.ticker}` : tokenSymbol,
      price: priceUsd ? `$${priceUsd.toFixed(8)}` : null,
      marketCap: formatUsd(marketCap),
      volume: formatUsd(volume),
      holders: formatNumber(holders),
      totalTx: formatNumber(totalTx),
      buyTx: formatNumber(buyTx),
      sellTx: formatNumber(sellTx),
      snipers: formatNumber(snipers),
      athMarketCap: formatUsd(athMarketCap),
      devHolding: devHolding != null ? `${(devHolding * 100).toFixed(2)}%` : "0.00%",
      imageUrl: data.imageUrl || null,
      buyUrl: `https://pump.fun/coin/${tokenCa}`,
    });
  } catch {
    return NextResponse.json(
      {
        ca: tokenCa,
        name: projectName,
        symbol: tokenSymbol,
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
        buyUrl: "https://pump.fun",
      },
      { status: 500 }
    );
  }
}
