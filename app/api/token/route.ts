import { NextResponse } from "next/server";
import { getTokenInfo } from "@/lib/cache";

export async function GET() {
  const token = await getTokenInfo();
  return NextResponse.json(token);
}
