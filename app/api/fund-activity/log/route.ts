import { NextRequest, NextResponse } from "next/server";
import { readFundLog } from "@/lib/fund-activity";
import { isTelegramConfigured, telegramConfigSummary } from "@/lib/telegram";

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === `Bearer ${adminPassword}`;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    log: readFundLog(),
    telegram: {
      configured: isTelegramConfigured(),
      ...telegramConfigSummary(),
    },
  });
}
