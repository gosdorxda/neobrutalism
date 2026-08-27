"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, ExternalLink, ShieldCheck, TrendingUp, ArrowRightLeft, Swords, Users, UserCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useProjectName } from "@/components/project-name-provider";
import { DonateDrawer } from "@/components/donate-drawer";
import { NetworkSolana, WalletPhantom } from "@web3icons/react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
    <Button
      variant="reverse"
      size="sm"
      onClick={handleCopy}
      className="self-stretch min-h-[2.5rem] px-3 text-xs shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

function useCountUp(value: string | null, duration: number = 800) {
  const [display, setDisplay] = useState<string>("-");
  const prevValueRef = useRef<string | null>(null);

  useEffect(() => {
    if (!value) {
      setDisplay("-");
      return;
    }

    const match = value.match(/^([^0-9\-\.]*)?([\d,.]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }

    const prefix = match[1] || "";
    const numericString = match[2].replace(/,/g, "");
    const suffix = match[3] || "";
    const target = parseFloat(numericString);

    if (isNaN(target)) {
      setDisplay(value);
      return;
    }

    const prevMatch = prevValueRef.current?.match(/^[^0-9\-\.]*([\d,.]+).*$/);
    const start = prevMatch ? parseFloat(prevMatch[1].replace(/,/g, "")) : 0;
    const startTime = performance.now();
    const decimalPlaces = (numericString.split(".")[1] || "").length;

    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function formatCountUp(num: number, decimals: number): string {
      if (decimals === 0 && num >= 1000) {
        return Math.round(num).toLocaleString();
      }
      return num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }

    function frame(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = start + (target - start) * eased;

      const formatted = formatCountUp(current, decimalPlaces);

      setDisplay(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
    prevValueRef.current = value;
  }, [value, duration]);

  return display;
}

function AnimatedValue({ value }: { value: string | null }) {
  const display = useCountUp(value);
  return <span>{display}</span>;
}

function formatCa(ca: string) {
  return ca;
}

function formatCompact(valueStr: string | null): string | null {
  if (!valueStr) return valueStr;
  const n = Number(valueStr.replace(/,/g, ""));
  if (isNaN(n)) return valueStr;
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function FoundationWalletCard() {
  const { projectName } = useProjectName();
  const [wallet, setWallet] = useState("");
  const [balanceSol, setBalanceSol] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadWallet() {
      try {
        const res = await fetch("/api/wallet", { cache: "no-store" });
        const data = await res.json();
        setWallet(data.address || "");
        setBalanceSol(data.balanceSol ?? null);
      } catch {
        setWallet("");
        setBalanceSol(null);
      }
    }
    loadWallet();
  }, []);

  const handleCopy = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!wallet) return null;

  return (
    <div className="mt-6 bg-secondary-background border-2 border-border rounded-base p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-base bg-[#AB9FF2] border-2 border-black flex items-center justify-center shrink-0 overflow-hidden">
            <WalletPhantom variant="mono" color="#FFFFFF" className="w-full h-full" />
          </div>
          <div>
            <h3 className="text-lg font-heading text-foreground leading-tight">Foundation Wallet</h3>
            <p className="text-xs font-base text-foreground/60 mt-0.5">
              Public address for rewards and donations
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-base text-foreground/50 uppercase tracking-wider">Balance</p>
          <p className="text-xl font-heading text-foreground inline-flex items-center gap-1.5">
            {balanceSol !== null ? `${balanceSol.toFixed(4)}` : "—"}
            <span className="text-sm font-base text-foreground/60">SOL</span>
            <NetworkSolana variant="branded" className="w-5 h-5" />
          </p>
        </div>
      </div>

      {/* Address row */}
      <div className="bg-background border-2 border-border rounded-base p-1.5 flex items-center gap-2">
        <code
          className="flex-1 min-w-0 px-3 py-2 text-sm font-mono text-foreground truncate"
          title={wallet}
        >
          {wallet}
        </code>
        <Button
          variant="reverse"
          size="sm"
          className="h-9 px-3 text-xs shrink-0"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3.5 h-3.5 sm:mr-1.5" /> : <Copy className="w-3.5 h-3.5 sm:mr-1.5" />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </Button>
        <Button
          variant="reverse"
          size="icon"
          className="h-9 w-9 shrink-0 bg-chart-2 text-white border-2 border-border hover:bg-chart-2/90"
          asChild
          title="View on Solscan"
        >
          <a
            href={`https://solscan.io/account/${wallet}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
        <DonateDrawer
          wallet={wallet}
          projectName={projectName}
          className="h-9 px-3 text-xs shrink-0 bg-chart-4 text-black border-2 border-border hover:bg-chart-4/90"
        />
      </div>

      {/* Mobile balance */}
      <div className="mt-4 sm:hidden flex items-center justify-between">
        <span className="text-[10px] font-base text-foreground/50 uppercase tracking-wider">Balance</span>
        <span className="text-base font-heading text-foreground inline-flex items-center gap-1.5 whitespace-nowrap">
          {balanceSol !== null ? `${balanceSol.toFixed(4)} SOL` : "Loading..."}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
            <path fill="url(#solana-mobile__a)" d="M18.413 7.902a.62.62 0 0 1-.411.163H3.58c-.512 0-.77-.585-.416-.928l2.369-2.284a.6.6 0 0 1 .41-.169H20.42c.517 0 .77.59.41.935z" />
            <path fill="url(#solana-mobile__b)" d="M18.413 19.158a.62.62 0 0 1-.411.158H3.58c-.512 0-.77-.58-.416-.923l2.369-2.29a.6.6 0 0 1 .41-.163H20.42c.517 0 .77.586.41.928z" />
            <path fill="url(#solana-mobile__c)" d="M18.413 10.473a.62.62 0 0 0-.411-.158H3.58c-.512 0-.77.58-.416.923l2.369 2.29c.111.103.257.16.41.163H20.42c.517 0 .77-.586.41-.928z" />
            <defs>
              <linearGradient id="solana-mobile__a" x1="3.001" x2="21.459" y1="55.041" y2="54.871" gradientUnits="userSpaceOnUse">
                <stop stopColor="#599DB0" />
                <stop offset="1" stopColor="#47F8C3" />
              </linearGradient>
              <linearGradient id="solana-mobile__b" x1="3.001" x2="21.341" y1="9.168" y2="9.027" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C44FE2" />
                <stop offset="1" stopColor="#73B0D0" />
              </linearGradient>
              <linearGradient id="solana-mobile__c" x1="4.036" x2="20.303" y1="12.003" y2="12.003" gradientUnits="userSpaceOnUse">
                <stop stopColor="#778CBF" />
                <stop offset="1" stopColor="#5DCDC9" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      </div>
    </div>
  );
}

export function TokenInfo({ initialToken }: { initialToken?: {
  ca: string;
  name: string;
  symbol: string;
  price: string | null;
  marketCap: string | null;
  volume: string | null;
  holders: string | null;
  totalTx: string | null;
  buyTx: string | null;
  sellTx: string | null;
  snipers: string | null;
  insiders: string | null;
  devHolding: string;
  imageUrl: string | null;
  buyUrl: string;
} }) {
  const { projectName, tokenSymbol } = useProjectName();
  const [token, setToken] = useState(initialToken ?? null);
  const [loading, setLoading] = useState(initialToken === undefined);

  useEffect(() => {
    if (initialToken) return; // already have data from SSR
    
    async function loadToken() {
      try {
        const res = await fetch("/api/token?_t=" + Date.now(), { cache: "no-store" });
        const data = await res.json();
        if (data && data.ca) {
          setToken(data);
        }
      } catch {
        // keep current state
      }
      setLoading(false);
    }

    loadToken();
  }, [initialToken]);

  const displayCa = token?.ca ? formatCa(token.ca) : "";

  const metrics = [
    { label: "Price", value: token?.price },
    { label: "Market Cap", value: token?.marketCap },
    { label: "Volume", value: token?.volume },
    { label: "Holders", value: token?.holders },
  ];

  const badges = [
    { icon: ArrowRightLeft, label: "Total TX", value: token?.totalTx },
    { icon: Users, label: "Insider", value: token?.insiders },
    { icon: Swords, label: "Snipers", value: token?.snipers },
    { icon: UserCheck, label: "Dev Holding", value: token?.devHolding },
  ];

  return (
    <section id="token" className="w-full bg-gradient-to-b from-secondary-background to-background py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-heading text-foreground mb-2">
            Token Info
          </h2>
          <p className="text-sm font-base text-foreground/60 max-w-lg mx-auto">
            Live data from SolanaTracker.
          </p>
        </div>

        <Card className="border-2 border-border shadow-shadow">
          <CardContent className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-base bg-main border-2 border-border flex items-center justify-center overflow-hidden">
                  {loading || !token?.imageUrl ? (
                    <span className="text-2xl">🐱</span>
                  ) : (
                    <img
                      src={token.imageUrl}
                      alt={token.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-heading text-foreground">
                      {loading ? <Skeleton width={96} height={24} borderRadius={4} /> : token?.name}
                    </h3>
                    <Badge variant="neutral" className="text-xs font-base">
                      {loading ? "..." : token?.symbol}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-base text-main mt-1">
                    <ShieldCheck className="w-3 h-3" />
                    Deployed on Solana
                  </div>
                </div>
              </div>
              <a
                href={token?.buyUrl || "https://pump.fun"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="reverse" className="w-full sm:w-auto text-sm">
                  <img src="/pump-fun.svg" alt="" className="w-4 h-4" />
                  Buy Token
                </Button>
              </a>
            </div>

            {/* Contract Address */}
            <div className="mb-5">
              <label className="text-[10px] font-base text-foreground/60 uppercase tracking-wider block mb-1.5">
                Contract Address
              </label>
              <div className="flex items-center gap-2">
                <a
                  href={`https://solscan.io/token/${token?.ca}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-auto min-h-[2.5rem] bg-secondary-background border-2 border-border rounded-base px-3 py-2 flex items-center min-w-0 hover:border-main transition-colors"
                >
                  {loading ? (
                    <Skeleton height={20} width="100%" borderRadius={4} />
                  ) : (
                    <code className="text-sm font-mono text-foreground break-all leading-tight" title={token?.ca}>
                      {displayCa}
                    </code>
                  )}
                </a>
                {!loading && token && (
                  <CopyButton text={token.ca} />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <a
                  href={`https://solscan.io/token/${token?.ca}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-base text-foreground/50 hover:text-main transition-colors inline-flex items-center gap-1"
                >
                  View on Solscan
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-foreground/30">|</span>
                <a
                  href={token?.buyUrl || "https://pump.fun"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-base text-foreground/50 hover:text-main transition-colors inline-flex items-center gap-1"
                >
                  View on pump.fun
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="bg-secondary-background border-2 border-border rounded-base p-3"
                >
                  <p className="text-[10px] font-base text-foreground/60 uppercase tracking-wider">
                    {metric.label}
                  </p>
                  {loading || !metric.value ? (
                    <Skeleton width={64} height={20} borderRadius={4} className="mt-1" />
                  ) : (
                    <p className="text-base font-heading text-foreground mt-0.5">
                      <AnimatedValue value={metric.value} />
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* On-chain stats badges */}
            <div className="pt-4 border-t-2 border-border">
              <p className="text-[10px] font-base text-foreground/60 uppercase tracking-wider mb-2">On-chain Stats</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.label}
                      className="bg-secondary-background border border-border rounded-base h-auto min-h-[2.5rem] py-2 px-2.5 w-full flex items-center whitespace-nowrap text-xs font-base"
                    >
                      <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0 text-foreground/70" />
                      <span className="text-foreground/60 mr-1">{badge.label}:</span>
                      {loading || !badge.value ? (
                        <Skeleton width={40} height={14} borderRadius={4} />
                      ) : (
                        <AnimatedValue value={badge.value} />
                      )}
                    </div>
                  );
                })}
                {!loading && token?.buyTx && token?.sellTx && (
                  <div className="bg-secondary-background border border-border rounded-base h-auto min-h-[2.5rem] py-2 px-2.5 w-full flex items-center whitespace-nowrap text-xs font-base">
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5 shrink-0 text-foreground/70" />
                    <span className="text-foreground/60 mr-1">Buy/Sell:</span>
                    <AnimatedValue value={formatCompact(token.buyTx)} /> / <AnimatedValue value={formatCompact(token.sellTx)} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Foundation Wallet */}
        <FoundationWalletCard />

        {/* Foundation Wallet Note */}
        <div className="mt-4 bg-white border border-border rounded-base p-4">
          <p className="text-xs font-base text-foreground/70 leading-relaxed">
            Donations to this wallet fund emergency needs beyond regular feeding: medical care for sick or injured cats, rescues, and other welfare expenses.
          </p>
        </div>
      </div>
    </section>
  );
}
