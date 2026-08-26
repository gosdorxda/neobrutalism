import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "batches.json");

const defaultBatch = {
  fees: "$0",
  cats: "0",
  food: "0kg",
  txHash: "-",
  isActive: true,
  receiptImages: [],
  receiptStore: "",
  receiptItem: "",
  receiptTotal: "$0",
  notes: "",
  essentials: [],
  photos: [],
};

function readBatches() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    const batches = JSON.parse(data);
    return batches.map((b: Record<string, unknown>) => {
      const essentialsRaw = Array.isArray(b.essentials) ? b.essentials : [];
      const essentials = essentialsRaw.map((e: Record<string, unknown>) => ({
        name: typeof e.name === "string" ? e.name : "",
        price: typeof e.price === "string" ? e.price : "",
        tx: typeof e.tx === "string" ? e.tx : "",
      }));
      return { ...defaultBatch, ...b, essentials };
    });
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

export async function GET() {
  const batches = readBatches();
  return NextResponse.json(batches);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const batches = readBatches();

  const existingIndex = batches.findIndex((b: { id: number }) => b.id === body.id);

  if (existingIndex !== -1) {
    batches[existingIndex] = { ...batches[existingIndex], ...body };
    writeBatches(batches);
    return NextResponse.json(batches[existingIndex]);
  }

  const { id: _, ...bodyWithoutId } = body;
  const newId = batches.length > 0 ? Math.max(...batches.map((b: { id: number }) => b.id)) + 1 : 0;
  const newBatch = {
    ...defaultBatch,
    id: newId,
    name: `Batch #${newId}`,
    status: "In Progress",
    startDate: "",
    targetDate: "",
    ...bodyWithoutId,
  };

  batches.unshift(newBatch);
  writeBatches(batches);
  return NextResponse.json(newBatch, { status: 201 });
}
