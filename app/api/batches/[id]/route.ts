import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "batches.json");

function readBatches() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeBatches(batches: unknown[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(batches, null, 2), "utf8");
}

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === `Bearer ${adminPassword}`;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const batchId = Number(id);
  const batches = readBatches();
  const filtered = batches.filter((b: { id: number }) => b.id !== batchId);

  if (filtered.length === batches.length) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  writeBatches(filtered);
  return NextResponse.json({ success: true });
}
