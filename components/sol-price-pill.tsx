"use client";

import { useEffect, useState } from "react";
import { NetworkSolana } from "@web3icons/react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function SolPricePill({ initialPrice }: { initialPrice?: number | null }) {
  const [price, setPrice] = useState<number | null>(initialPrice ?? null);
  const [loading, setLoading] = useState(initialPrice === undefined || initialPrice === null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/sol-price", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.solPrice) {
          setPrice(data.solPrice);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="hidden sm:inline-flex items-center gap-2 bg-secondary-background border border-border rounded-base pl-1.5 pr-2.5 py-1">
      <div className="w-6 h-6 rounded-full bg-[#9945FF]/10 flex items-center justify-center">
        <NetworkSolana variant="branded" className="w-4 h-4" />
      </div>
      {loading || price === null ? (
        <Skeleton width={56} height={14} borderRadius={4} />
      ) : (
        <span className="text-xs font-heading text-foreground">
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)}
        </span>
      )}
    </div>
  );
}
