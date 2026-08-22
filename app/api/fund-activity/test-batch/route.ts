import { NextRequest, NextResponse } from "next/server";
import { testBatchPost } from "@/lib/fund-activity";

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === `Bearer ${adminPassword}`;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const res = await testBatchPost();
  return NextResponse.json(res);
}
