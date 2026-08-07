import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { getSettings } from "@/lib/settings";
import { TopDonor } from "@/app/api/top-donors/route";

const execFileAsync = promisify(execFile);
const dataFilePath = path.join(process.cwd(), "data", "top-donors.json");

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const cronSecret = process.env.CRON_SECRET;
  if (authHeader === `Bearer ${adminPassword}`) return true;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  return false;
}

function writeDonors(donors: TopDonor[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(donors, null, 2), "utf8");
}

function formatCompactNumber(value: number): string {
  if (!value || isNaN(value)) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatUsd(value: number): string {
  if (!value || isNaN(value)) return "$0.00";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

type GmgnTrader = {
  address: string;
  buy_volume_cur: number;
  sell_volume_cur: number;
  amount_cur: number;
  buy_tx_count_cur: number;
  sell_tx_count_cur: number;
  avatar: string | null;
  name: string | null;
  twitter_username: string | null;
  tags: string[];
  maker_token_tags: string[];
};

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gmgnApiKey = process.env.GMGN_API_KEY;
  if (!gmgnApiKey) {
    return NextResponse.json(
      { error: "GMGN_API_KEY not configured" },
      { status: 500 }
    );
  }

  const { tokenCa } = getSettings();

  if (!tokenCa || tokenCa.length < 32) {
    return NextResponse.json({ error: "Token CA not configured" }, { status: 500 });
  }

  try {
    const gmgnCliPath = process.platform === "win32"
      ? path.join(process.cwd(), "node_modules", ".bin", "gmgn-cli.cmd")
      : path.join(process.cwd(), "node_modules", ".bin", "gmgn-cli");

    const { stdout, stderr } = await execFileAsync(
      gmgnCliPath,
      [
        "token", "traders",
        "--chain", "sol",
        "--address", tokenCa,
        "--limit", "10",
        "--order-by", "buy_volume_cur",
        "--direction", "desc",
        "--raw",
      ],
      {
        env: { ...process.env, GMGN_API_KEY: gmgnApiKey },
        timeout: 30000,
        shell: true,
      }
    );

    if (stderr && !stdout) {
      return NextResponse.json({ error: stderr.trim() }, { status: 500 });
    }

    const data = JSON.parse(stdout);
    const traders: GmgnTrader[] = Array.isArray(data?.list) ? data.list : [];

    if (traders.length === 0) {
      return NextResponse.json(
        { error: "No trader data returned from GMGN" },
        { status: 404 }
      );
    }

    const donors: TopDonor[] = traders.map((trader, index) => {
      const volume = (trader.buy_volume_cur || 0) + (trader.sell_volume_cur || 0);
      return {
        rank: index + 1,
        wallet: trader.address,
        volume: formatUsd(volume),
        holding: formatCompactNumber(trader.amount_cur || 0),
        estimatedFee: formatUsd(volume * 0.01),
        txCount: (trader.buy_tx_count_cur || 0) + (trader.sell_tx_count_cur || 0),
        avatar: trader.avatar || null,
        name: trader.name || null,
        twitter: trader.twitter_username || null,
      };
    });

    writeDonors(donors);

    return NextResponse.json({ success: true, count: donors.length, donors });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
