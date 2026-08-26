"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Heart, ShieldCheck, Camera, Receipt, Package, Wallet, Soup, Activity, Cat, Info, Calendar } from "lucide-react";

import { useProjectName } from "@/components/project-name-provider";
import { formatUsd } from "@/lib/utils";
import { useCountUpNumber } from "@/hooks/use-count-up";
import { useCallback, useEffect, useState } from "react";

type ApiBatch = {
  id: number;
  name: string;
  status: string;
  startDate: string;
  targetDate: string;
  isActive: boolean;
  fees: string;
  cats: string;
};

function parseDate(dateStr: string): number | null {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.getTime();
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function Hero({ initialStats }: { initialStats?: { totalCats: number; totalFees: number; totalFeesSol: number; totalFeesCumulative: number; totalFood: number; feedingRounds: number; estimatedBowls: number } }) {
  const { projectName, tokenSymbol } = useProjectName();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    totalCats: initialStats?.totalCats ?? 0,
    totalFees: initialStats?.totalFees ?? 0,
    totalFeesSol: initialStats?.totalFeesSol ?? 0,
    totalFeesCumulative: initialStats?.totalFeesCumulative ?? 0,
    totalFood: initialStats?.totalFood ?? 0,
    estimatedBowls: initialStats?.estimatedBowls ?? 0,
  });
  const [showSol, setShowSol] = useState(false);
  const [activeBatch, setActiveBatch] = useState<ApiBatch | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [buyUrl, setBuyUrl] = useState("https://pump.fun");
  const [isLoading, setIsLoading] = useState(initialStats === undefined);
  const [batchLoading, setBatchLoading] = useState(true);

  const animatedTotalFees = useCountUpNumber(stats.totalFees);
  const animatedTotalFeesSol = useCountUpNumber(stats.totalFeesSol);
  const animatedEstimatedBowls = useCountUpNumber(stats.estimatedBowls);

  const loadHeroData = useCallback(async () => {
    try {
      const [statsRes, tokenRes, batchesRes] = await Promise.all([
        fetch("/api/stats", { cache: "no-store" }),
        fetch("/api/token", { cache: "no-store" }),
        fetch("/api/batches", { cache: "no-store" }),
      ]);

      const statsData = await statsRes.json().catch(() => ({}));
      const tokenData = await tokenRes.json().catch(() => ({}));
      const batchesData: ApiBatch[] = await batchesRes.json().catch(() => []);

      setStats(statsData);
      setBuyUrl(tokenData.buyUrl || "https://pump.fun");

      const active =
        batchesData.find((b) => b.status === "In Progress" || b.status === "Feeding") ??
        batchesData.find((b) => b.isActive);
      setActiveBatch(active || null);
    } catch {
      // keep defaults on any error
    } finally {
      setIsLoading(false);
      setBatchLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHeroData();
  }, [loadHeroData]);

  useEffect(() => {
    function reload() {
      loadHeroData();
    }
    function onVisibility() {
      if (document.visibilityState === "visible") reload();
    }
    function onPageshow(event: PageTransitionEvent) {
      if (event.persisted) reload();
    }
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", reload);
    window.addEventListener("pageshow", onPageshow);
    return () => {
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", reload);
      window.removeEventListener("pageshow", onPageshow);
    };
  }, [loadHeroData]);

  useEffect(() => {
    if (!activeBatch) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setProgress(0);
      return;
    }

    const startDate = parseDate(activeBatch.startDate);
    const targetDate = parseDate(activeBatch.targetDate);

    if (!startDate || !targetDate) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setProgress(0);
      setIsFinished(false);
      return;
    }

    const start = startDate;
    const target = targetDate;

    function updateTimer() {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
        setIsFinished(true);
        return;
      }

      setIsFinished(false);

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });

      const totalDuration = target - start;
      const elapsed = now - start;
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      setProgress(progressPercent);
    }

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [activeBatch]);

  return (
    <section className="relative min-h-[calc(85vh-5rem)] overflow-hidden bg-background px-4 pt-28 pb-10 sm:px-6 lg:px-8">
      {/* Animated paw print background decorations */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <img
          src="/cat-paw.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute top-[6%] -left-6 w-44 h-44 sm:w-52 sm:h-52 opacity-[0.12] rotate-45"
        />
        <img
          src="/cat-paw-a.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute top-[10%] right-[3%] w-40 h-40 sm:w-48 sm:h-48 opacity-[0.10] -rotate-12"
        />
        <img
          src="/cat-paw-b.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute top-[30%] -right-8 w-48 h-48 sm:w-56 sm:h-56 opacity-[0.10] rotate-45"
        />
        <img
          src="/cat-paw-c.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute top-[52%] -left-10 w-36 h-36 sm:w-44 sm:h-44 opacity-[0.09] -rotate-45"
        />
        <img
          src="/cat-paw.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute bottom-[18%] right-[5%] w-44 h-44 sm:w-52 sm:h-52 opacity-[0.11] -rotate-45"
        />
        <img
          src="/cat-paw-a.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute bottom-[8%] -left-8 w-40 h-40 sm:w-48 sm:h-48 opacity-[0.10] rotate-12"
        />
        {/* Scattered paw prints in the middle area */}
        <img
          src="/cat-paw-b.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute top-[24%] left-[12%] w-28 h-28 sm:w-36 sm:h-36 opacity-[0.08] rotate-12"
        />
        <img
          src="/cat-paw-c.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute top-[28%] right-[14%] w-32 h-32 sm:w-40 sm:h-40 opacity-[0.08] -rotate-45"
        />
        <img
          src="/cat-paw.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute top-[46%] right-[8%] w-28 h-28 sm:w-36 sm:h-36 opacity-[0.07] rotate-45"
        />
        <img
          src="/cat-paw-a.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute bottom-[32%] left-1/3 w-32 h-32 sm:w-40 sm:h-40 opacity-[0.08] -rotate-12"
        />
        <img
          src="/cat-paw-b.svg"
          alt=""
          decoding="async"
          fetchPriority="low"
          className="absolute bottom-[26%] right-1/3 w-28 h-28 sm:w-36 sm:h-36 opacity-[0.07] rotate-12"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center space-y-4">
          
          {/* Stats Badge */}
          <p className="text-sm font-base text-foreground/80 px-2 py-0.5 rounded-base -mb-1 pb-1">
            {stats.totalFeesCumulative > 0
              ? `${Math.round(stats.totalFeesCumulative)} bowls filled so far`
              : "Next feeding batch coming soon"}
          </p>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-foreground leading-tight tracking-tight max-w-3xl">
            Every Swap Fills a Bowl
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl font-base text-foreground/70 max-w-2xl">
            All creator rewards go straight to food for street cats. Track every batch with receipts, photos, and on-chain records.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-4">
            <Button variant="default" size="lg" asChild>
                <a href={buyUrl} target="_blank" rel="noopener noreferrer">
                  Buy {tokenSymbol}
                </a>
            </Button>
            <Button variant="neutral" size="lg" asChild>
              <a href="#batches">
                See Impact History
              </a>
            </Button>
          </div>

          {/* Analytics Card - Horizontal with Live Data */}
          <div className="w-full max-w-4xl mt-6 relative">
            <Card className="border-2 border-border bg-white relative">
              {/* Elegant Background Pattern */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-main rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-chart-1 rounded-full blur-3xl"></div>
              </div>

              <TooltipProvider>
                <CardContent className="p-4 relative z-10">
                  <div className="flex flex-col gap-2">
                  
                  {/* Top Row: Batch Label & Countdown */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Batch Label - Same size as countdown */}
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-foreground" />
                      {batchLoading ? (
                        <Skeleton width={128} height={24} borderRadius={4} />
                      ) : (
                        <span className="text-xl font-heading text-foreground">
                          {activeBatch ? activeBatch.name : "No Active Batch"}
                        </span>
                      )}
                    </div>

                    {/* Countdown */}
                    {batchLoading ? (
                        <Skeleton width={112} height={24} borderRadius={4} />
                    ) : activeBatch ? (
                      isFinished ? (
                        <span className="text-base font-heading text-main animate-pulse">
                          Feeding time!
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-heading text-foreground">{timeLeft.days}</span>
                            <span className="text-xs text-foreground/60">d</span>
                          </div>
                          <span className="text-foreground/40">:</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-heading text-foreground">{timeLeft.hours}</span>
                            <span className="text-xs text-foreground/60">h</span>
                          </div>
                          <span className="text-foreground/40">:</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-heading text-foreground">{timeLeft.minutes}</span>
                            <span className="text-xs text-foreground/60">m</span>
                          </div>
                          <span className="text-foreground/40">:</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-heading text-foreground animate-pulse">{timeLeft.seconds}</span>
                            <span className="text-xs text-foreground/60">s</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="text-sm font-base text-foreground/60">-</span>
                    )}
                  </div>

                  {/* Progress Bar - Bigger with Shimmer */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-base text-foreground/60">
                      {batchLoading ? (
                        <>
                          <Skeleton width={112} height={16} borderRadius={4} />
                          <Skeleton width={96} height={16} borderRadius={4} />
                        </>
                      ) : (
                        <>
                          <span>
                            {activeBatch
                              ? isFinished
                                ? "Feeding time!"
                                : "Next Feeding"
                                : "No Active Batch"}
                          </span>
                          <span>{activeBatch ? formatDisplayDate(activeBatch.targetDate) : "-"}</span>
                        </>
                      )}
                    </div>
                    <div className="h-4 bg-secondary-background border-2 border-border rounded-base overflow-hidden relative">
                      {batchLoading ? (
                        <Skeleton height="100%" width="100%" borderRadius={0} />
                      ) : (
                        <div 
                          className="h-full bg-main transition-all duration-1000 ease-linear relative overflow-hidden"
                          style={{ width: `${progress}%` }}
                        >
                          {activeBatch && (
                            <>
                              {/* Flowing shimmer effect like smoke */}
                              <div className="absolute inset-0 w-full h-full">
                                <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"></div>
                              </div>
                              {/* Animated glow at the edge */}
                              <div className="absolute right-0 top-0 h-full w-2 bg-white/60 blur-sm animate-[pulse-glow_1.5s_ease-in-out_infinite]"></div>
                              <div className="absolute right-0 top-0 h-full w-1 bg-white animate-[edge-shine_2s_ease-in-out_infinite]"></div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Transparency Info Below Progress Bar */}
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[10px] font-base text-foreground/50">
                        100% of creator rewards become cat food. See{" "}
                        <a 
                          href="#token" 
                          className="text-foreground/70 font-heading underline hover:text-main transition-colors"
                        >
                          the proof
                        </a>
                      </p>
                      {/* Live Indicator - Minimal */}
                      <div className="flex items-center gap-1">
                        <div className="relative w-2 h-2">
                          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-50"></div>
                          <div className="relative w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-[9px] font-heading text-green-500/70">LIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Custom keyframes for shimmer */}
                  <style jsx>{`
                    @keyframes shimmer {
                      0% {
                        transform: translateX(-100%);
                        opacity: 0;
                      }
                      50% {
                        opacity: 1;
                      }
                      100% {
                        transform: translateX(100%);
                        opacity: 0;
                      }
                    }
                    @keyframes pulse-glow {
                      0%, 100% {
                        opacity: 0.6;
                        transform: scaleY(1);
                      }
                      50% {
                        opacity: 0.9;
                        transform: scaleY(1.1);
                      }
                    }
                    @keyframes edge-shine {
                      0%, 100% {
                        opacity: 0.7;
                      }
                      50% {
                        opacity: 1;
                      }
                    }
                  `}</style>

                  {/* Bottom Row: Stats & CTA */}
                  <div className="flex items-center justify-between gap-2 border-t-2 border-border pt-2">
                    {/* Stats */}
                    <div className="flex gap-2 sm:gap-6 min-w-0">
                      <div className="text-center">
                        {isLoading ? (
                          <Skeleton className="w-24 h-7 sm:w-32 sm:h-8 mb-0.5 mx-auto" borderRadius={4} />
                        ) : (
                          <div className="text-lg sm:text-2xl font-heading mb-0.5 transition-all duration-300" style={{ background: "linear-gradient(90deg,#5a9a0c 34.62%,#009970)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            {showSol
                              ? `${animatedTotalFeesSol.toFixed(4)} SOL`
                              : formatUsd(animatedTotalFees)}
                          </div>
                        )}
                        <div className="text-[10px] sm:text-xs font-base text-foreground/60 flex items-center justify-center gap-1 whitespace-nowrap h-5 sm:h-6">
                          <Wallet className="w-3 h-3" />
                          <span>Rewards</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 cursor-help align-middle text-foreground/40 hover:text-foreground transition-colors hidden sm:inline" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Creator rewards accumulated in this batch</p>
                            </TooltipContent>
                          </Tooltip>
                          <button
                            type="button"
                            onClick={() => setShowSol((s) => !s)}
                            className="ml-0.5 sm:ml-1 px-1.5 py-0.5 text-[10px] font-heading border border-border rounded-base bg-secondary-background hover:bg-background transition-colors"
                          >
                            {showSol ? "USD" : "SOL"}
                          </button>
                        </div>
                      </div>
                      <div className="h-auto w-px bg-border"></div>
                      <div className="text-center">
                        {isLoading ? (
                          <Skeleton className="w-16 h-7 sm:w-20 sm:h-8 mb-0.5 mx-auto" borderRadius={4} />
                        ) : (
                          <div className="text-lg sm:text-2xl font-heading text-foreground mb-0.5 transition-all duration-300">
                            {Math.round(animatedEstimatedBowls)}
                          </div>
                        )}
                        <div className="text-[10px] sm:text-xs font-base text-foreground/60 flex items-center justify-center gap-1 whitespace-nowrap h-5 sm:h-6">
                          <Soup className="w-3 h-3" />
                          <span>Bowls</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 cursor-help align-middle text-foreground/40 hover:text-foreground transition-colors hidden sm:inline" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Estimated bowls based on rewards (1 USD = 1 bowl)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="shrink-0">
                      <Button variant="reverse" size="default" asChild className="px-2.5 sm:px-4 text-xs sm:text-sm">
                        <a href={buyUrl} target="_blank" rel="noopener noreferrer">
                          <Cat className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Feed a Cat</span>
                          <span className="sm:hidden">Feed</span>
                        </a>
                      </Button>
                    </div>
                  </div>

                </div>
                </CardContent>
              </TooltipProvider>
            </Card>

          {/* Trust Indicators - 4 Columns Below */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-4xl mt-3">
            <div className="flex items-center justify-center gap-2 bg-background border-2 border-border px-3 py-2 rounded-base">
              <ShieldCheck className="w-4 h-4 text-foreground flex-shrink-0" />
              <span className="text-xs font-base text-foreground">100% to Food</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-background border-2 border-border px-3 py-2 rounded-base">
              <Camera className="w-4 h-4 text-foreground flex-shrink-0" />
              <span className="text-xs font-base text-foreground">Photo Proof</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-background border-2 border-border px-3 py-2 rounded-base">
              <Receipt className="w-4 h-4 text-foreground flex-shrink-0" />
              <span className="text-xs font-base text-foreground">Receipt Posted</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-background border-2 border-border px-3 py-2 rounded-base">
              <Calendar className="w-4 h-4 text-foreground flex-shrink-0" />
              <span className="text-xs font-base text-foreground">Regular Feeding</span>
            </div>
          </div>

          {/* Disclaimer/Note */}
          <div className="w-full max-w-4xl mt-4 px-2">
            <p className="text-xs font-base text-foreground/50 text-center leading-relaxed">
              We&apos;re a volunteer team of cat lovers who believe every street cat deserves a meal.
              For every batch, we buy food, snap photos, and post receipts. No team allocation, no hidden fees.
              That&apos;s the {projectName} promise.
            </p>
          </div>
          </div>

        </div>
      </div>
    </section>
  );
}

