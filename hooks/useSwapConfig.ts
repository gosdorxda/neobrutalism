"use client";

import { useEffect, useState } from "react";
import { DEFAULT_RPC } from "@/lib/constants";

export type SwapConfig = {
  tokenMint: string;
  tokenSymbol: string;
  feeWallet: string;
  feeBps: number;
  rpcUrl: string;
  loading: boolean;
};

export function useSwapConfig(): SwapConfig {
  const [config, setConfig] = useState<SwapConfig>({
    tokenMint: "",
    tokenSymbol: "TOKEN",
    feeWallet: "",
    feeBps: 100,
    rpcUrl: DEFAULT_RPC,
    loading: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, tokenRes] = await Promise.all([
          fetch("/api/settings", { cache: "no-store" }),
          fetch("/api/token", { cache: "no-store" }),
        ]);
        const settingsData = await settingsRes.json().catch(() => ({}));
        const tokenData = await tokenRes.json().catch(() => ({}));
        setConfig({
          tokenMint: (settingsData.tokenCa || "").trim(),
          tokenSymbol: (tokenData.symbol || "TOKEN").trim(),
          feeWallet: (settingsData.foundationWallet || "").trim(),
          feeBps:
            typeof settingsData.swapFeeBps === "number" ? settingsData.swapFeeBps : 100,
          rpcUrl: DEFAULT_RPC,
          loading: false,
        });
      } catch {
        setConfig((c) => ({ ...c, loading: false }));
      }
    }
    load();
  }, []);

  return config;
}
