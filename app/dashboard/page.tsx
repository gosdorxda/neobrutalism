"use client";

import { useEffect, useState } from "react";
import { WalletCards } from "@/components/dashboard/wallet-cards";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import type { DashboardData, WalletData } from "@/components/dashboard/types";
import { RefreshCw, AlertCircle } from "lucide-react";
import { NetworkSolana } from "@web3icons/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [wallets, setWallets] = useState<{ foundation: WalletData | null; creator: WalletData | null }>({
    foundation: null,
    creator: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load dashboard: ${res.status}`);
        const json = (await res.json()) as DashboardData;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadWallets() {
      setWalletLoading(true);
      try {
        const res = await fetch("/api/wallets", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json) {
          setWallets({
            foundation: json.foundation as WalletData,
            creator: json.creator as WalletData,
          });
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setWalletLoading(false);
      }
    }

    loadWallets();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <main className="flex-1 w-full bg-background py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading text-foreground">On-chain Dashboard</h1>
            <p className="text-sm font-base text-foreground/60 mt-1 max-w-xl">
              Full on-chain transparency: foundation & creator wallet balances, plus recent transactions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data?.updatedAt && (
              <span className="text-xs font-base text-foreground/50">
                Updated {new Date(data.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Button variant="neutral" size="icon" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading} aria-label="Refresh dashboard">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-base p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-heading text-red-700">Failed to load dashboard</p>
              <p className="text-xs font-base text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* SOL Price pill */}
        <div className="mb-6 inline-flex items-center gap-2.5 bg-secondary-background border-2 border-border rounded-base pl-2 pr-3 py-1.5 shadow-shadow">
          <div className="w-7 h-7 rounded-full bg-[#9945FF]/10 flex items-center justify-center">
            <NetworkSolana variant="branded" className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-heading text-foreground/60">SOL</span>
            {loading || !data?.solPrice ? (
              <span className="text-sm font-heading text-foreground/30">—</span>
            ) : (
              <span className="text-sm font-heading text-foreground">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(data.solPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Wallet Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-heading text-foreground mb-3">Wallet Overview</h2>
          <WalletCards
            foundation={data?.wallets.foundation || wallets.foundation}
            creator={data?.wallets.creator || wallets.creator}
            loading={loading && walletLoading}
          />
        </section>

        {/* Transaction Tabs */}
        <section>
          <h2 className="text-xl font-heading text-foreground mb-3">Recent Transactions</h2>
          <Tabs defaultValue="foundation" className="w-full">
            <TabsList className="w-full sm:w-auto flex flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="foundation" className="flex-1 sm:flex-none">
                Foundation TX
              </TabsTrigger>
              <TabsTrigger value="creator" className="flex-1 sm:flex-none">
                Creator TX
              </TabsTrigger>
              <TabsTrigger value="token" className="flex-1 sm:flex-none">
                Token TX
              </TabsTrigger>
            </TabsList>
            <TabsContent value="foundation" className="mt-3">
              <TransactionTable
                transactions={data?.wallets.foundation.recentTx || []}
                loading={loading}
              />
            </TabsContent>
            <TabsContent value="creator" className="mt-3">
              <TransactionTable
                transactions={data?.wallets.creator.recentTx || []}
                loading={loading}
              />
            </TabsContent>
            <TabsContent value="token" className="mt-3">
              <TransactionTable
                transactions={data?.tokenRecentTx || []}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* Footer note */}
        <p className="mt-8 text-xs font-base text-foreground/50 text-center">
          Data is fetched live from Solana RPC, PumpFun, and public price APIs. Refresh every 60 seconds.
        </p>
      </div>
    </main>
  );
}
