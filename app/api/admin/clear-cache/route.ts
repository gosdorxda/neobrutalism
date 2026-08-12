import { NextRequest, NextResponse } from "next/server";
import { redis, isRedisEnabled } from "@/lib/redis";

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === `Bearer ${adminPassword}`;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isRedisEnabled() || !redis) {
    return NextResponse.json({ message: "Redis not configured" });
  }

  try {
    const keys = await redis.keys("sol:*");
    const statsKeys = await redis.keys("stats:*");
    const tokenKeys = await redis.keys("token:*");
    const walletKeys = await redis.keys("wallets:*");

    const allKeys = [...keys, ...statsKeys, ...tokenKeys, ...walletKeys];

    if (allKeys.length > 0) {
      await redis.del(...allKeys);
    }

    return NextResponse.json({ message: `Cleared ${allKeys.length} cache keys`, keys: allKeys });
  } catch (err) {
    return NextResponse.json({ error: "Failed to clear cache", detail: String(err) }, { status: 500 });
  }
}