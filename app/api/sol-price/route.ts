import { NextResponse } from "next/server";
import { getSolPrice } from "@/lib/cache";

export async function GET() {
  const price = await getSolPrice();

  if (price === null) {
    return NextResponse.json({ error: "Failed to fetch SOL price" }, { status: 500 });
  }

  return NextResponse.json({ solPrice: price });
}
