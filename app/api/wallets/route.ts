import { NextResponse } from "next/server";
import { getWallets } from "@/lib/cache";

export async function GET() {
  const wallets = await getWallets();
  return NextResponse.json(wallets);
}
