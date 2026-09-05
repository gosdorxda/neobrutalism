"use client";

import { useEffect, useState } from "react";
import { getQuote, type JupiterQuote } from "@/lib/jupiter";

export function useJupiterQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: number;
  decimals: number;
  slippageBps: number;
  enabled: boolean;
}) {
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const {
      amount,
      decimals,
      inputMint,
      outputMint,
      slippageBps,
      enabled,
    } = params;

    if (!enabled || !amount || amount <= 0 || !inputMint || !outputMint) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setQuote(null);
      setError(null);
      setLoading(false);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    const amountSmallest = Math.floor(amount * Math.pow(10, decimals));
    if (amountSmallest <= 0) {
      setQuote(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      const q = await getQuote({
        inputMint,
        outputMint,
        amount: String(amountSmallest),
        slippageBps,
      });
      if (cancelled) return;
      if (q) {
        setQuote(q);
        setError(null);
      } else {
        setQuote(null);
        setError("No route found. Try a different amount.");
      }
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.amount,
    params.decimals,
    params.inputMint,
    params.outputMint,
    params.slippageBps,
    params.enabled,
  ]);

  return { quote, loading, error };
}
