import { NextRequest, NextResponse } from "next/server";
import { runFundActivityCheck } from "@/lib/fund-activity";

function authorized(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (auth === `Bearer ${adminPassword}`) return true;

  const url = new URL(request.url);
  const cronSecret = process.env.FUND_ACTIVITY_CRON_SECRET;
  if (cronSecret && url.searchParams.get("secret") === cronSecret) return true;

  return false;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runFundActivityCheck();
  return NextResponse.json(result);
}
