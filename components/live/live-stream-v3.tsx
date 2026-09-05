"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, Package, DollarSign, Soup, PaperBag, TrendingUp, Volume2, VolumeX, Activity } from "lucide-react";
import { NetworkSolana } from "@web3icons/react";
import { useSettings } from "@/components/settings-provider";

type Batch = { id: number; name: string; status: string; isActive: boolean; startDate: string; targetDate: string; fees: string; cats: string; food: string; photos: string[] };
type Stats = { totalCats: number; totalFees: number; totalFood: number; estimatedBowls: number; feedingRounds: number };
type Photo = { src: string; batch: string; cats: string; food: string };
type Particle = { angle: number; dist: number; emoji: string; delay: number };
type TxCard = { id: number; side: "buy" | "sell"; wallet: string; usd: number; sol: number; tokenAmount: number; particles: Particle[] };

const BURST_EMOJIS = ["\u{1F43E}", "$", "\u2728", "\u{1F431}", "\u{1F389}"];

export function LiveStreamV3() {
  const { settings } = useSettings();
  const buyUrl = settings?.tokenCa ? "https://pump.fun/coin/" + settings.tokenCa : "#";
  const tokenSymbol = settings?.projectName || "CATBOWL";

  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [txFeed, setTxFeed] = useState<TxCard[]>([]);
  const [burstTx, setBurstTx] = useState<{ feeUsd: number; feeSol: number; particles: Particle[] } | null>(null);
  const [showSol, setShowSol] = useState(false);
  const [activity, setActivity] = useState({ lastTxTime: null as number | null, lastRewardUsd: 0, lastRewardSol: 0, txCount: 0, totalRewardsUsd: 0, totalRewardsSol: 0 });
  const [burstKey, setBurstKey] = useState(0);
  const [timeAgo, setTimeAgo] = useState("\u2014");

  const mutedRef = useRef(true);
  const audioRef = useRef<AudioContext | null>(null);
  const txIdRef = useRef(100);
  const firstPollRef = useRef(true);
  const txQueueRef = useRef<{ side: "buy" | "sell"; wallet: string; usd: number; sol: number; tokenAmount: number }[]>([]);

  const rewardsGradient = { background: "linear-gradient(90deg,#5a9a0c 34.62%,#009970)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" };

  function formatFee(v: number): string {
    if (v === 0) return "0";
    if (v < 0.001) return v.toFixed(8);
    if (v < 0.01) return v.toFixed(6);
    if (v < 1) return v.toFixed(4);
    return v.toFixed(2);
  }

  function formatCompact(n: number): string {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    return n.toFixed(4);
  }

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const initAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!audioRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (Ctx) audioRef.current = new Ctx();
    }
    audioRef.current?.resume().catch(() => {});
  }, []);

  const playTing = useCallback(() => {
    if (mutedRef.current) return;
    const ctx = audioRef.current; if (!ctx) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = 880 + Math.random() * 120;
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.23);
  }, []);

  function formatDate(d: string) {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return d; }
  }

  useEffect(() => {
    if (!activeBatch || !activeBatch.targetDate) return;
    const target = new Date(activeBatch.targetDate).getTime();
    const start = activeBatch.startDate ? new Date(activeBatch.startDate).getTime() : target - 7 * 24 * 60 * 60 * 1000;
    const update = () => {
      const now = Date.now();
      if (now >= target) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); setProgress(100); setIsFinished(true); return; }
      setIsFinished(false);
      const dist = target - now;
      setTimeLeft({ days: Math.floor(dist / 86400000), hours: Math.floor((dist % 86400000) / 3600000), minutes: Math.floor((dist % 3600000) / 60000), seconds: Math.floor((dist % 60000) / 1000) });
      setProgress(Math.min(100, Math.max(0, ((now - start) / (target - start)) * 100)));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [activeBatch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const load = () => {
      fetch("/api/stats", { cache: "no-store" }).then(r => r.json()).then(setStats).catch(() => {});
      fetch("/api/batches", { cache: "no-store" }).then(r => r.json()).then((bs: Batch[]) => {
        const active = bs.find(b => b.isActive) || bs[0] || null;
        setActiveBatch(active);
        const all: Photo[] = bs.flatMap(b => (b.photos || []).map(p => ({ src: p, batch: b.name || "Batch #" + b.id, cats: b.cats || "0", food: b.food || "0kg" })));
        const shuffled = [...all].sort(() => Math.random() - 0.5);
        setPhotos(shuffled);
      }).catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/live/tx", { cache: "no-store" });
        const data = await res.json();
        if (data.txs && data.txs.length > 0) {
          txQueueRef.current.push(...data.txs);
        }
      } catch {
        // ignore
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;
    const process = () => {
      if (!active) return;
      const queue = txQueueRef.current;
      if (queue.length > 0) {
        const tx = queue.shift()!;
        const id = txIdRef.current++;
        const particles: Particle[] = Array.from({ length: 6 }, (_, i) => ({
          angle: (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,
          dist: 16 + Math.random() * 14,
          emoji: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
          delay: 0.1 + Math.random() * 0.08,
        }));
          setTxFeed(prev => [{ id, side: tx.side, wallet: tx.wallet, usd: tx.usd, sol: tx.sol, tokenAmount: tx.tokenAmount || 0, particles }, ...prev].slice(0, 6));
        setActivity(prev => ({ lastTxTime: Date.now(), lastRewardUsd: tx.usd * 0.003, lastRewardSol: tx.sol * 0.003, txCount: prev.txCount + 1, totalRewardsUsd: prev.totalRewardsUsd + tx.usd * 0.003, totalRewardsSol: prev.totalRewardsSol + tx.sol * 0.003 }));
        if (!firstPollRef.current) {
          const burstParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
            angle: (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
            dist: 40 + Math.random() * 60,
            emoji: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
            delay: Math.random() * 0.1,
          }));
          setBurstTx({ feeUsd: tx.usd * 0.003, feeSol: tx.sol * 0.003, particles: burstParticles });
          setBurstKey(k => k + 1);
          window.setTimeout(() => setBurstTx(null), 1500);
          playTing();
        }
        firstPollRef.current = false;
      }
      const delay = queue.length > 3 ? 400 : 1000;
      timeout = setTimeout(process, delay);
    };
    timeout = setTimeout(process, 500);
    return () => { active = false; clearTimeout(timeout); };
  }, [playTing]);

  useEffect(() => {
    const update = () => {
      if (!activity.lastTxTime) { return; }
      const diff = Math.floor((Date.now() - activity.lastTxTime) / 1000);
      setTimeAgo(diff < 60 ? diff + "s ago" : diff < 3600 ? Math.floor(diff / 60) + "m ago" : Math.floor(diff / 3600) + "h ago");
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [activity.lastTxTime]);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  const totalFees = stats?.totalFees ?? 0;
  const estimatedBowls = stats?.estimatedBowls ?? 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-orange-50 to-orange-100 text-foreground">
      <style>{`button.fixed.bottom-5.right-5, button.fixed.sm\\:bottom-6.sm\\:right-6 { display: none !important; }`}</style>
      <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
        <button type="button" onClick={() => { if (muted) initAudio(); setMuted(m => !m); }} className="inline-flex h-8 w-8 items-center justify-center rounded-base border-2 border-black bg-white/80 backdrop-blur transition-transform hover:scale-105 active:scale-95" aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={toggleFullscreen} className="inline-flex h-8 w-8 items-center justify-center rounded-base border-2 border-black bg-white/80 backdrop-blur transition-transform hover:scale-105 active:scale-95" aria-label="Fullscreen">
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 pt-8 pb-4 text-center sm:px-6">
        <h1 className="text-3xl font-heading tracking-tight text-foreground drop-shadow-[0_3px_0_rgba(0,0,0,0.08)] sm:text-5xl">The Bowl Meter</h1>
        <p className="mt-1.5 text-sm font-base text-foreground/50">Watch trades become meals.</p>
      </div>

      <div className="mx-auto flex max-w-screen-2xl gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 space-y-4">
        <div className="w-full rounded-base border-2 border-border bg-white p-4 shadow-[0_4px_0_0_#000] relative sm:p-4">
          <div className="absolute inset-0 opacity-[0.03] overflow-hidden rounded-base">
            <div className="absolute top-0 right-0 w-64 h-64 bg-main rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-chart-1 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 shrink-0 text-foreground sm:h-6 sm:w-6" />
                <span className="text-lg font-heading text-foreground sm:text-xl">{activeBatch ? activeBatch.name : "No Active Batch"}</span>
              </div>
              {activeBatch ? (
                isFinished ? (
                  <span className="text-base font-heading text-main animate-pulse">Feeding time!</span>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      <span className="text-lg font-heading text-foreground sm:text-xl">{timeLeft.days}</span>
                      <span className="text-[10px] text-foreground/60 sm:text-xs">d</span>
                    </div>
                    <span className="text-foreground/40">:</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      <span className="text-lg font-heading text-foreground sm:text-xl">{timeLeft.hours}</span>
                      <span className="text-[10px] text-foreground/60 sm:text-xs">h</span>
                    </div>
                    <span className="text-foreground/40">:</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      <span className="text-lg font-heading text-foreground sm:text-xl">{timeLeft.minutes}</span>
                      <span className="text-[10px] text-foreground/60 sm:text-xs">m</span>
                    </div>
                    <span className="text-foreground/40">:</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      <span className="text-lg font-heading text-foreground animate-pulse sm:text-xl">{timeLeft.seconds}</span>
                      <span className="text-[10px] text-foreground/60 sm:text-xs">s</span>
                    </div>
                  </div>
                )
              ) : (
                <span className="text-sm font-base text-foreground/60">-</span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-base text-foreground/60">
                <span>{activeBatch ? (isFinished ? "Feeding time!" : "Next Feeding") : "No Active Batch"}</span>
                <span>{activeBatch ? formatDate(activeBatch.targetDate) : "-"}</span>
              </div>
              <div className="h-4 border-2 border-border rounded-base bg-secondary-background overflow-hidden relative">
                <div className="h-full bg-main transition-all duration-1000 ease-linear relative overflow-hidden" style={{ width: progress + "%" }}>
                  {activeBatch && (
                    <>
                      <div className="absolute inset-0 w-full h-full">
                        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                      </div>
                      <div className="absolute right-0 top-0 h-full w-2 bg-white/60 blur-sm animate-[pulse-glow_1.5s_ease-in-out_infinite]" />
                      <div className="absolute right-0 top-0 h-full w-1 bg-white animate-[edge-shine_2s_ease-in-out_infinite]" />
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] font-base text-foreground/50">
                  100% of creator rewards become cat food. No cash, just bowls.
                </p>
                <div className="flex items-center gap-1">
                  <div className="relative h-2 w-2">
                    <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-green-500 opacity-50" />
                    <div className="relative h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[9px] font-heading text-green-500/70">LIVE</span>
                </div>
              </div>
            </div>

            <style>{`@keyframes shimmer{0%{transform:translateX(-100%);opacity:0}50%{opacity:1}100%{transform:translateX(100%);opacity:0}}@keyframes pulse-glow{0%,100%{opacity:0.6;transform:scaleY(1)}50%{opacity:0.9;transform:scaleY(1.1)}}@keyframes edge-shine{0%,100%{opacity:0.7}50%{opacity:1}}`}</style>

            <div className="flex items-center justify-between gap-2 border-t-2 border-border pt-2">
              <div className="flex gap-2 sm:gap-6 min-w-0">
                <div className="text-center">
                  <div className="text-lg font-heading mb-0.5 transition-all duration-300 sm:text-2xl" style={{ background: "linear-gradient(90deg,#5a9a0c 34.62%,#009970)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    ${totalFees.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                  <div className="flex items-center justify-center gap-1 whitespace-nowrap text-[10px] font-base text-foreground/60 sm:text-xs">
                    <DollarSign className="h-3 w-3" />
                    <span>Rewards</span>
                  </div>
                </div>
                <div className="h-auto w-px bg-border" />
                <div className="text-center">
                  <div className="text-lg font-heading text-foreground mb-0.5 transition-all duration-300 sm:text-2xl">{estimatedBowls.toLocaleString("en-US")}</div>
                  <div className="flex items-center justify-center gap-1 whitespace-nowrap text-[10px] font-base text-foreground/60 sm:text-xs">
                    <Soup className="h-3 w-3" />
                    <span>Bowls</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-center">
                <div className="text-lg font-heading text-foreground mb-0.5 transition-all duration-300 sm:text-2xl">{(totalFees / 5).toFixed(1)}kg</div>
                <div className="flex items-center justify-center gap-1 whitespace-nowrap text-[10px] font-base text-foreground/60 sm:text-xs">
                  <PaperBag className="h-3 w-3" />
                  <span>Est. Food</span>
                </div>
              </div>
            </div>
          </div>
        </div>

          <h3 className="mt-2 px-1 text-xs font-heading uppercase tracking-wider text-foreground/50">Feeding Proof</h3>
        <div className="space-y-3 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}>
          {mounted && photos.length > 0 ? (
            <>
              <div className="overflow-hidden">
                <div className="flex w-max items-start gap-3 py-1" style={{ animation: "marquee 90s linear infinite" }}>
                  {[...photos, ...photos].map((p, i) => (
                    <div key={"r0-" + i} className="shrink-0">
                      <img src={p.src} alt={p.batch} className="h-40 w-40 rounded-base object-cover sm:h-48 sm:w-48" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden">
                <div className="flex w-max items-start gap-3 py-1" style={{ animation: "marquee 80s linear infinite reverse" }}>
                  {[...photos.slice().reverse(), ...photos.slice().reverse()].map((p, i) => (
                    <div key={"r1-" + i} className="shrink-0">
                      <img src={p.src} alt={p.batch} className="h-36 w-36 rounded-base object-cover sm:h-44 sm:w-44" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm font-base text-foreground/40">
              {mounted ? "No feeding photos yet" : "Loading photos..."}
            </div>
          )}
        </div>
        </div>

        <div className="w-[460px] shrink-0 sm:w-[520px] space-y-3">
          <div className="rounded-base border-2 border-border bg-white p-4 shadow-[0_4px_0_0_#000]">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Activity className="h-4 w-4 text-main" />
              <h3 className="text-xs font-heading uppercase tracking-wider text-foreground/60">Activity</h3>
            </div>
            <p className="mb-2 text-center text-[10px] font-base text-foreground/50">Last creator reward</p>
            <div className="relative mb-2 flex justify-center overflow-hidden py-1">
              <div className="relative">
                <motion.span key={burstKey} initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }} className="inline-block text-4xl font-heading tabular-nums sm:text-5xl" style={rewardsGradient}>{showSol ? "+" + formatFee(activity.lastRewardSol) + " SOL" : "+$" + formatFee(activity.lastRewardUsd)}</motion.span>
                  <AnimatePresence>
                    {burstTx && (
                      <>
                        <motion.div className="absolute left-1/2 top-1/2 h-6 w-6 rounded-full border-2 border-main" style={{ marginLeft: -12, marginTop: -12 }} initial={{ scale: 0, opacity: 0.6 }} animate={{ scale: 8, opacity: 0 }} transition={{ duration: 0.6 }} />
                        {burstTx.particles.map((p, i) => (
                          <motion.span key={i} className="absolute left-1/2 top-1/2 text-lg" initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 0 }} animate={{ x: "calc(-50% + " + Math.cos(p.angle) * p.dist + "px)", y: "calc(-50% + " + Math.sin(p.angle) * p.dist + "px)", opacity: 0, scale: 1 }} transition={{ duration: 0.7, delay: p.delay, ease: "easeOut" }}>{p.emoji}</motion.span>
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            <div className="space-y-1 border-t border-border/30 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-base text-foreground/40">Last tx</span>
                <span className="text-xs font-heading text-foreground/70">{timeAgo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-base text-foreground/40">Avg reward</span>
                <span className="text-xs font-heading tabular-nums text-foreground/70">{activity.txCount > 0 ? (showSol ? "+" + formatFee(activity.totalRewardsSol / activity.txCount) + " SOL" : "+$" + formatFee(activity.totalRewardsUsd / activity.txCount)) : "\u2014"}</span>
              </div>
            </div>
          </div>

            <div className="mt-1 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-main" />
              <h3 className="px-1 text-xs font-heading uppercase tracking-wider text-foreground/50">Last Tx</h3>
              <button type="button" onClick={() => setShowSol(s => !s)} className="ml-auto rounded-base border border-border bg-secondary-background px-1.5 py-0.5 text-[9px] font-heading text-foreground/70 transition-colors hover:bg-background">{showSol ? "SOL" : "USD"}</button>
            </div>
            <div className="space-y-2 overflow-hidden">
              {mounted && txFeed.map((tx) => (
                <motion.div key={tx.id} layout initial={{ opacity: 0, y: -60, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }} transition={{ type: "spring", stiffness: 350, damping: 28 }} className="flex items-center gap-2.5 rounded-base border-2 border-border bg-secondary-background px-3 py-3.5">
                  <span className="inline-flex shrink-0 items-stretch overflow-hidden rounded-base">
                    <span className={"border-r border-black/15 px-2 py-1.5 text-[9px] font-heading text-white " + (tx.side === "buy" ? "bg-green-500" : "bg-red-500")}>{tx.side === "buy" ? "BUY" : "SELL"}</span>
                    <span className="bg-gray-100 px-2 py-1.5 font-mono text-[10px] text-foreground/50">{tx.wallet}</span>
                  </span>
                  <span className="text-base font-heading tabular-nums text-foreground">{formatCompact(tx.tokenAmount)}</span>
                  <span className="text-[10px] font-base text-foreground/40">{tokenSymbol}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-main/10 px-2 py-0.5">
                      <NetworkSolana variant="branded" className="h-3.5 w-3.5" />
                      <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.4, delay: 0.15 }} className="text-xs font-heading tabular-nums" style={rewardsGradient}>{showSol ? "+" + formatFee(tx.sol * 0.003) : "+$" + formatFee(tx.usd * 0.003)}</motion.span>
                    </span>
                    <span className="text-base font-heading tabular-nums text-foreground/70">{showSol ? formatCompact(tx.sol) + " SOL" : "$" + formatCompact(tx.usd)}</span>
                  </div>
                </motion.div>
              ))}
              {mounted && txFeed.length === 0 && (
                <div className="flex h-24 items-center justify-center text-[11px] font-base text-foreground/40">Waiting for trades...</div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
