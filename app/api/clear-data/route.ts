import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === `Bearer ${adminPassword}`;
}

const BATCHES_FILE = path.join(process.cwd(), "data", "batches.json");
const FUND_ACTIVITY_FILE = path.join(process.cwd(), "data", "fund-activity.json");
const STATS_CACHE_FILE = path.join(process.cwd(), "data", "stats-cache.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const DEFAULT_FUND_STATE = {
  lastSignature: null,
  currentBatchId: null,
  currentBatchMessageId: null,
  lastBatchSnapshot: "",
  log: [],
};

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let batchesCleared = false;
  let fundCleared = false;
  let statsCacheCleared = false;
  let uploadFoldersCleared = 0;

  try {
    fs.writeFileSync(BATCHES_FILE, JSON.stringify([], null, 2), "utf8");
    batchesCleared = true;

    fs.writeFileSync(
      FUND_ACTIVITY_FILE,
      JSON.stringify(DEFAULT_FUND_STATE, null, 2),
      "utf8"
    );
    fundCleared = true;

    if (fs.existsSync(STATS_CACHE_FILE)) {
      fs.unlinkSync(STATS_CACHE_FILE);
      statsCacheCleared = true;
    }

    if (fs.existsSync(UPLOADS_DIR)) {
      const entries = fs.readdirSync(UPLOADS_DIR);
      for (const entry of entries) {
        const entryPath = path.join(UPLOADS_DIR, entry);
        fs.rmSync(entryPath, { recursive: true, force: true });
        uploadFoldersCleared++;
      }
    }

    return NextResponse.json({
      success: true,
      cleared: {
        batches: batchesCleared,
        fundActivity: fundCleared,
        statsCache: statsCacheCleared,
        uploadFolders: uploadFoldersCleared,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to clear data", detail: String(err) },
      { status: 500 }
    );
  }
}
