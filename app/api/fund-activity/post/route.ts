import { NextRequest, NextResponse } from "next/server";
import {
  postManualRewards,
  postManualPurchase,
  postFeedingProof,
} from "@/lib/fund-activity";

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === `Bearer ${adminPassword}`;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = body.type;

    if (type === "rewards") {
      const r = await postManualRewards({
        amountSol: Number(body.amountSol) || undefined,
        amountUsd: Number(body.amountUsd) || undefined,
        txHash: typeof body.txHash === "string" ? body.txHash : undefined,
        batch: typeof body.batch === "string" ? body.batch : undefined,
      });
      return NextResponse.json(r);
    }

    if (type === "purchase") {
      const r = await postManualPurchase({
        store: typeof body.store === "string" ? body.store : undefined,
        item: typeof body.item === "string" ? body.item : undefined,
        totalUsd: Number(body.totalUsd) || undefined,
        txHash: typeof body.txHash === "string" ? body.txHash : undefined,
        receiptUrl: typeof body.receiptUrl === "string" ? body.receiptUrl : undefined,
        batch: typeof body.batch === "string" ? body.batch : undefined,
      });
      return NextResponse.json(r);
    }

    if (type === "feeding-proof") {
      const batchId = Number(body.batchId);
      if (!Number.isFinite(batchId)) {
        return NextResponse.json(
          { error: "batchId is required" },
          { status: 400 }
        );
      }
      const siteUrl =
        request.headers.get("origin") ||
        (request.headers.get("host")
          ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`
          : "");
      const r = await postFeedingProof(batchId, siteUrl);
      return NextResponse.json(r);
    }

    return NextResponse.json({ error: "Invalid type (use 'rewards', 'purchase', or 'feeding-proof')" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to post manual entry" }, { status: 500 });
  }
}
