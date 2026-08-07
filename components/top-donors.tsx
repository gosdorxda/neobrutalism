"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Trophy, Wallet, BarChart3, ArrowRightLeft, DollarSign, Award } from "lucide-react";
import { useEffect, useState } from "react";

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

function formatWallet(wallet: string): string {
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function walletAvatarUrl(wallet: string): string {
  return `https://api.dicebear.com/9.x/identicon/png?seed=${encodeURIComponent(wallet)}`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-base border border-border bg-yellow-400 text-foreground">
        <Trophy className="w-4 h-4" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-base border border-border bg-gray-300 text-foreground">
        <Trophy className="w-4 h-4" />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-base border border-border bg-amber-700 text-white">
        <Trophy className="w-4 h-4" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-base border border-border bg-secondary-background text-xs font-heading text-foreground">
      {rank}
    </span>
  );
}

export function TopDonors() {
  const [donors, setDonors] = useState<TopDonor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDonors() {
      try {
        const res = await fetch("/api/top-donors", { cache: "no-store" });
        const data = await res.json().catch(() => []);
        setDonors(Array.isArray(data) ? data : []);
      } catch {
        setDonors([]);
      } finally {
        setLoading(false);
      }
    }

    loadDonors();
  }, []);

  return (
    <section className="w-full bg-secondary-background py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-heading text-foreground mb-2">
            Top Donors
          </h2>
          <p className="text-sm font-base text-foreground/60 max-w-lg mx-auto">
            Wallets with the biggest buy/sell volume on the token contract. Every trade contributes to the cat food fund.
          </p>
        </div>

        <Card className="border-2 border-border bg-white rounded-none">
          <CardContent className="p-0 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white min-w-[600px]">
                <thead className="bg-white border-b-2 border-border">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-heading text-foreground/60 w-14 sm:w-16">
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Rank
                      </span>
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-heading text-foreground/60">
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        Wallet
                      </span>
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-heading text-foreground/60">
                      <span className="inline-flex items-center justify-end gap-1">
                        Volume
                        <BarChart3 className="w-3 h-3" />
                      </span>
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-heading text-foreground/60">
                      <span className="inline-flex items-center justify-end gap-1">
                        Holding
                        <Wallet className="w-3 h-3" />
                      </span>
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-heading text-foreground/60">
                      <span className="inline-flex items-center justify-end gap-1">
                        Est. Fee
                        <DollarSign className="w-3 h-3" />
                      </span>
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-heading text-foreground/60">
                      <span className="inline-flex items-center justify-end gap-1">
                        TXs
                        <ArrowRightLeft className="w-3 h-3" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border last:border-b-0">
                          <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-6" /></td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3"><Skeleton className="h-4 w-10 ml-auto" /></td>
                        </tr>
                      ))
                    : donors.map((donor) => (
                        <tr
                          key={donor.wallet}
                          className="border-b border-border last:border-b-0 bg-white"
                        >
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <RankBadge rank={donor.rank} />
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <a
                              href={`https://solscan.io/account/${donor.wallet}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-main hover:text-foreground transition-colors"
                              title={donor.wallet}
                            >
                              <Avatar className="size-5 sm:size-6 outline-1">
                                <AvatarImage src={donor.avatar || walletAvatarUrl(donor.wallet)} alt={donor.name || donor.wallet} />
                                <AvatarFallback className="text-[10px]">
                                  {donor.wallet.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {formatWallet(donor.wallet)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-heading text-chart-4">{donor.volume}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-heading text-foreground">{donor.holding}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-heading text-chart-3">{donor.estimatedFee}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-base text-foreground/60">{donor.txCount}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {!loading && donors.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm font-base text-foreground/50">No top donor data available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
