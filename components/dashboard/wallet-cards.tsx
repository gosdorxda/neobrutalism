"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WalletData } from "@/components/dashboard/types";
import { Wallet, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }
  return (
    <Button variant="noShadow" size="icon" className="h-8 w-8" onClick={handleCopy} aria-label="Copy address">
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}

function WalletCard({
  title,
  description,
  wallet,
  loading,
  extra,
}: {
  title: string;
  description: string;
  wallet: WalletData | null;
  loading: boolean;
  extra?: React.ReactNode;
}) {
  const address = wallet?.address || "";

  return (
    <Card className="border-2 border-border shadow-shadow">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-base bg-main border-2 border-border flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-main-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-heading text-foreground leading-tight">{title}</h3>
              <p className="text-xs font-base text-foreground/60 mt-0.5">{description}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 min-h-[136px]">
            <div className="h-12 w-full rounded-base bg-secondary-background animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-20 w-full rounded-base bg-secondary-background animate-pulse" />
              <div className="h-20 w-full rounded-base bg-secondary-background animate-pulse" />
            </div>
          </div>
        ) : !wallet ? (
          <div className="bg-secondary-background border-2 border-border rounded-base p-4 text-center">
            <p className="text-sm font-base text-foreground/60">Wallet address not configured</p>
          </div>
        ) : address ? (
          <>
            <div className="bg-background border-2 border-border rounded-base p-1.5 flex items-center gap-2 mb-4">
              <code className="flex-1 min-w-0 px-3 py-2 text-sm font-mono text-foreground truncate" title={address}>
                {address}
              </code>
              <CopyButton text={address} />
              <Button variant="noShadow" size="icon" className="h-8 w-8" asChild>
                <a href={`https://solscan.io/account/${address}`} target="_blank" rel="noopener noreferrer" aria-label="View on Solscan">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-secondary-background border-2 border-border rounded-base p-3">
                <p className="text-[10px] font-base text-foreground/60 uppercase tracking-wider">SOL Balance</p>
                <p className="text-xl font-heading text-foreground mt-0.5">
                  {wallet.solBalance != null ? `${wallet.solBalance.toFixed(6)}` : "—"}
                  <span className="text-sm font-base text-foreground/60 ml-1">SOL</span>
                </p>
              </div>
              <div className="bg-secondary-background border-2 border-border rounded-base p-3">
                <p className="text-[10px] font-base text-foreground/60 uppercase tracking-wider">USD Value</p>
                <p className="text-xl font-heading text-foreground mt-0.5">
                  {wallet.solValueUsd != null
                    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.solValueUsd)
                    : "—"}
                </p>
              </div>
            </div>

            {extra}
          </>
        ) : (
          <div className="bg-secondary-background border-2 border-border rounded-base p-4 text-center">
            <p className="text-sm font-base text-foreground/60">Wallet address not configured</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WalletCards({
  foundation,
  creator,
  loading,
}: {
  foundation: WalletData | null;
  creator: WalletData | null;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <WalletCard
        title="Foundation Wallet"
        description="Donations & reserves for cat welfare"
        wallet={foundation}
        loading={loading}
      />
      <WalletCard
        title="Creator Wallet"
        description="Project creator / dev wallet"
        wallet={creator}
        loading={loading}
        extra={
          creator && creator.devClaimableSol != null ? (
            <div className="mt-3 bg-secondary-background border-2 border-border rounded-base p-3">
              <p className="text-[10px] font-base text-foreground/60 uppercase tracking-wider">Dev Claimable</p>
              <p className="text-lg font-heading text-foreground mt-0.5">
                {creator.devClaimableSol.toFixed(6)} SOL
                {creator.devClaimableUsd != null && (
                  <span className="text-sm font-base text-foreground/60 ml-2">
                    ({new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(creator.devClaimableUsd)})
                  </span>
                )}
              </p>
            </div>
          ) : null
        }
      />
    </div>
  );
}
