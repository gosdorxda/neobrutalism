"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useSwapConfig } from "@/hooks/useSwapConfig";
import { useJupiterQuote } from "@/hooks/useJupiterQuote";
import { appendSolFeeInstruction } from "@/lib/fee";
import { getSwapTransaction } from "@/lib/jupiter";
import { SOL_MINT, LAMPORTS_PER_SOL } from "@/lib/constants";
import { WalletButton } from "./WalletButton";
import { TokenInput } from "./TokenInput";
import { SettingsModal } from "./SettingsModal";
import { Button } from "@/components/ui/button";
import { Settings, ArrowDown, ExternalLink, Check, Loader2 } from "lucide-react";

export function SwapCard() {
  const config = useSwapConfig();
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [fromAmount, setFromAmount] = useState("");
  const [slippageBps, setSlippageBps] = useState(100);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);

  const amountNum = parseFloat(fromAmount) || 0;

  useEffect(() => {
    if (!config.tokenMint) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await connection.getParsedAccountInfo(
          new PublicKey(config.tokenMint)
        );
        const decimals = (res.value as { parsed?: { info?: { decimals?: number } } } | null)
          ?.parsed?.info?.decimals;
        if (!cancelled && typeof decimals === "number") {
          setTokenDecimals(decimals);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [config.tokenMint, connection]);

  const { quote, loading: quoteLoading, error: quoteError } = useJupiterQuote({
    inputMint: SOL_MINT,
    outputMint: config.tokenMint,
    amount: amountNum,
    decimals: 9,
    slippageBps,
    enabled: connected && !!config.tokenMint,
  });

  const feeBpsPercent = (config.feeBps / 100).toFixed(config.feeBps % 100 === 0 ? 0 : 2) + "%";
  const feeSol = amountNum * (config.feeBps / 10000);

  const toAmount =
    quote && tokenDecimals != null
      ? Number(quote.outAmount) / Math.pow(10, tokenDecimals)
      : null;
  const minReceive =
    quote && tokenDecimals != null
      ? Number(quote.otherAmountThreshold) / Math.pow(10, tokenDecimals)
      : null;
  const rate = toAmount && amountNum > 0 ? toAmount / amountNum : null;
  const priceImpact = quote?.priceImpactPct
    ? (parseFloat(quote.priceImpactPct) * 100).toFixed(2) + "%"
    : null;

  const canSwap =
    connected &&
    !!publicKey &&
    !!signTransaction &&
    amountNum > 0 &&
    !!quote &&
    !!config.tokenMint &&
    !!config.feeWallet &&
    !swapping;

  async function handleSwap() {
    setError(null);
    setTxSig(null);
    if (!connected || !publicKey || !signTransaction) {
      setError("Connect your wallet first.");
      return;
    }
    if (!config.tokenMint || !config.feeWallet) {
      setError("Swap is not configured. Ask an admin to set the token and fee wallet.");
      return;
    }
    if (amountNum <= 0) {
      setError("Enter an amount.");
      return;
    }
    if (!quote) {
      setError("No quote available. Try again.");
      return;
    }

    setSwapping(true);
    try {
      const swapTxB64 = await getSwapTransaction({
        quoteResponse: quote,
        userPublicKey: publicKey.toBase58(),
      });
      if (!swapTxB64) throw new Error("Failed to build swap transaction.");

      const feeLamports = Math.floor(
        amountNum * LAMPORTS_PER_SOL * (config.feeBps / 10000)
      );

      const newTx = await appendSolFeeInstruction({
        swapTransactionBase64: swapTxB64,
        userPublicKey: publicKey.toBase58(),
        feeWallet: config.feeWallet,
        feeLamports,
        connection,
      });

      const signed = await signTransaction(newTx);
      if (!signed) throw new Error("Failed to sign transaction.");

      const sig = await connection.sendRawTransaction(
        (signed as { serialize: () => Uint8Array }).serialize(),
        { skipPreflight: false }
      );
      await connection.confirmTransaction(sig, "confirmed");

      setTxSig(sig);
      setFromAmount("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/reject|cancel|denied|declined/i.test(msg)) {
        setError("Transaction rejected.");
      } else if (/insufficient|liquidity/i.test(msg)) {
        setError("Insufficient liquidity. Try a smaller amount.");
      } else if (/slippage/i.test(msg)) {
        setError("Slippage exceeded. Increase tolerance in settings.");
      } else {
        setError(msg);
      }
    } finally {
      setSwapping(false);
    }
  }

  const swapDisabled =
    !canSwap ||
    swapping ||
    quoteLoading ||
    !toAmount ||
    !!quoteError;

  const swapLabel = !connected
    ? "Connect wallet"
    : amountNum <= 0
    ? "Enter amount"
    : quoteLoading
    ? "Fetching rate..."
    : quoteError
    ? "No route"
    : swapping
    ? "Swapping..."
    : "Swap";

  if (config.loading) {
    return (
      <div className="border-2 border-border rounded-base bg-white p-5 sm:p-6 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
      </div>
    );
  }

  return (
    <div className="border-2 border-border rounded-base bg-white p-5 sm:p-6 shadow-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-heading text-foreground">Swap</h1>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-base border-2 border-border bg-secondary-background hover:bg-background transition-colors"
          aria-label="Swap settings"
        >
          <Settings className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Wallet */}
      <div className="mb-3">
        <WalletButton />
      </div>

      {/* From */}
      <TokenInput
        label="From"
        value={fromAmount}
        onChange={setFromAmount}
        symbol="SOL"
      />

      {/* Direction */}
      <div className="flex justify-center -my-1.5 relative z-10">
        <div className="w-8 h-8 rounded-full border-2 border-border bg-white flex items-center justify-center">
          <ArrowDown className="w-4 h-4 text-foreground" />
        </div>
      </div>

      {/* To */}
      <TokenInput
        label="To"
        value={
          toAmount != null
            ? toAmount.toLocaleString("en-US", { maximumFractionDigits: 4 })
            : quoteLoading
            ? "..."
            : "0"
        }
        symbol={config.tokenSymbol}
        readOnly
      />

      {/* Info */}
      {amountNum > 0 && (
        <div className="mt-3 space-y-1 text-xs font-base text-foreground/60">
          {rate != null && (
            <div className="flex justify-between">
              <span>Rate</span>
              <span>1 SOL ≈ {rate.toLocaleString("en-US", { maximumFractionDigits: 4 })} {config.tokenSymbol}</span>
            </div>
          )}
          {minReceive != null && (
            <div className="flex justify-between">
              <span>Minimum received</span>
              <span>{minReceive.toLocaleString("en-US", { maximumFractionDigits: 4 })} {config.tokenSymbol}</span>
            </div>
          )}
          {priceImpact && (
            <div className="flex justify-between">
              <span>Price impact</span>
              <span>{priceImpact}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Fee (feeds cats)</span>
            <span>{feeSol.toFixed(4)} SOL · {feeBpsPercent}</span>
          </div>
        </div>
      )}

      {/* Swap button */}
      <div className="mt-4">
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={connected ? handleSwap : () => {}}
          disabled={connected && swapDisabled}
        >
          {swapLabel}
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] font-base text-foreground/50 mt-3 text-center leading-relaxed">
        Swap fee {feeBpsPercent} supports feeding street cats. 100% becomes cat food. Swaps route via Jupiter.
      </p>

      {/* Success */}
      {txSig && (
        <div className="mt-3 flex items-center justify-between bg-chart-4/10 border border-border rounded-base px-3 py-2">
          <span className="text-xs font-heading text-chart-4 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Swap complete
          </span>
          <a
            href={`https://solscan.io/tx/${txSig}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-heading text-main underline hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            View tx <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 bg-red-600/10 border border-border rounded-base px-3 py-2">
          <p className="text-xs font-base text-red-700">{error}</p>
        </div>
      )}
      {quoteError && !error && (
        <div className="mt-3 bg-red-600/10 border border-border rounded-base px-3 py-2">
          <p className="text-xs font-base text-red-700">{quoteError}</p>
        </div>
      )}

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        slippageBps={slippageBps}
        onSlippageChange={setSlippageBps}
      />
    </div>
  );
}
