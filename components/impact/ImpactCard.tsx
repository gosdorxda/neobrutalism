"use client";

import { forwardRef } from "react";
import { Package, DollarSign, Repeat, PawPrint } from "lucide-react";
import type { ImpactData } from "@/lib/helius";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-foreground/60 flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-main" />
        {label}
      </span>
      <span className="font-heading text-foreground">{value}</span>
    </div>
  );
}

export const ImpactCard = forwardRef<
  HTMLDivElement,
  { data: ImpactData; projectName: string }
>(({ data, projectName }, ref) => {
  const feePercent = data.feeBps / 100 + "%";
  const walletShort = `${data.wallet.slice(0, 4)}...${data.wallet.slice(-4)}`;
  const fmtUsd = (n: number) =>
    "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const hasImpact = data.cats > 0;

  return (
    <div
      ref={ref}
      className="border-2 border-border rounded-base overflow-hidden w-full bg-white shadow-shadow"
    >
      {/* Header */}
      <div className="bg-main px-6 py-8 text-center relative overflow-hidden">
        <img
          src="/cat-paw.svg"
          alt=""
          className="absolute -top-4 -right-4 w-28 h-28 opacity-10 rotate-12 pointer-events-none"
        />
        <img
          src="/cat-paw-a.svg"
          alt=""
          className="absolute -bottom-6 -left-4 w-24 h-24 opacity-10 -rotate-12 pointer-events-none"
        />
        {hasImpact ? (
          <>
            <p className="text-[11px] font-base text-main-foreground/70 uppercase tracking-wider relative">
              Your Impact
            </p>
            <p className="text-6xl font-heading text-main-foreground my-2 leading-none relative">
              {data.cats}
            </p>
            <p className="text-sm font-heading text-main-foreground relative">
              cats fed by your trades
            </p>
          </>
        ) : (
          <>
            <PawPrint className="w-10 h-10 text-main-foreground/90 mx-auto mb-2 relative" />
            <p className="text-xl font-heading text-main-foreground relative">
              No bowls yet
            </p>
            <p className="text-sm font-base text-main-foreground/80 mt-1 relative">
              This wallet hasn&apos;t traded {projectName} yet.
            </p>
          </>
        )}
      </div>

      {/* Body */}
      {hasImpact ? (
        <div className="px-6 py-5 space-y-3 text-xs font-base">
          <Row icon={DollarSign} label="Trading volume" value={fmtUsd(data.volumeUsd)} />
          <Row
            icon={DollarSign}
            label={`Fees generated (${feePercent})`}
            value={fmtUsd(data.feeUsd)}
          />
          <Row icon={Package} label="Food funded" value={`${data.foodKg.toFixed(1)} kg`} />
          <Row
            icon={Repeat}
            label="Swaps"
            value={`${data.buyCount + data.sellCount} (${data.buyCount}B / ${data.sellCount}S)`}
          />
        </div>
      ) : (
        <div className="px-6 py-6 text-center">
          <p className="text-sm font-base text-foreground/70">
            Be the first to fill a bowl.
          </p>
          <p className="text-xs font-base text-foreground/50 mt-1">
            Every swap helps feed a street cat.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t-2 border-border bg-secondary-background text-center">
        <p className="text-sm font-heading text-foreground flex items-center justify-center gap-1.5">
          <PawPrint className="w-4 h-4 text-main" />
          {projectName}
        </p>
        <p className="text-[11px] font-base text-foreground/50 mt-1">
          {hasImpact
            ? `Every swap fills a bowl. Wallet ${walletShort}.`
            : `Wallet ${walletShort}.`}
        </p>
      </div>
    </div>
  );
});

ImpactCard.displayName = "ImpactCard";
