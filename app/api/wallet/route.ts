import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

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

export async function GET() {
  const { foundationWallet } = getSettings();

  if (!foundationWallet) {
    return NextResponse.json({ address: "", balanceSol: 0 });
  }

  const balanceSol = await fetchSolBalance(foundationWallet);

  return NextResponse.json({
    address: foundationWallet,
    balanceSol: balanceSol ?? 0,
  });
}
