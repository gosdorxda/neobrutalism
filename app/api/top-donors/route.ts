import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "top-donors.json");

export type TopDonor = {
  rank: number;
  wallet: string;
  volume: string;
  holding: string;
  estimatedFee: string;
  txCount: number;
  avatar?: string | null;
  name?: string | null;
  twitter?: string | null;
};

const MOCK_TOP_DONORS: TopDonor[] = [
  {
    rank: 1,
    wallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    volume: "$13,650.00",
    holding: "2.4M",
    estimatedFee: "$136.50",
    txCount: 156,
    avatar: null,
    name: null,
    twitter: null,
  },
  {
    rank: 2,
    wallet: "3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy",
    volume: "$8,770.50",
    holding: "1.8M",
    estimatedFee: "$87.71",
    txCount: 98,
    avatar: null,
    name: null,
    twitter: null,
  },
  {
    rank: 3,
    wallet: "DEic55w13RjpAJKQv1Lmv2X6j1w3b8i94B1W6LjvN6Q",
    volume: "$5,100.00",
    holding: "950K",
    estimatedFee: "$51.00",
    txCount: 64,
    avatar: null,
    name: null,
    twitter: null,
  },
  {
    rank: 4,
    wallet: "9sQnx2qWiqhK2JGy1m4h7QpXg9dY6v3rT5nK8LmJ2PqR",
    volume: "$5,250.25",
    holding: "620K",
    estimatedFee: "$52.50",
    txCount: 42,
    avatar: null,
    name: null,
    twitter: null,
  },
  {
    rank: 5,
    wallet: "A1Bc2Def3Ghi4Jkl5Mno6Pqr7Stu8Vwx9Yz0",
    volume: "$2,400.00",
    holding: "410K",
    estimatedFee: "$24.00",
    txCount: 31,
    avatar: null,
    name: null,
    twitter: null,
  },
];

function readDonors(): TopDonor[] {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch {
    return MOCK_TOP_DONORS;
  }
}

export async function GET() {
  const donors = readDonors();
  return NextResponse.json(donors, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
