"use client";

import { useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { useProjectName } from "@/components/project-name-provider";
import { cn } from "@/lib/utils";
import { Coins, CalendarDays, PawPrint } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

const MIN_VOLUME = 1_000;
const MAX_VOLUME = 1_000_000;
const STEP = 1_000;
const DEFAULT_VOLUME = 100_000;
const TICK_COUNT = 10;

const CREATOR_FEE_PERCENT = 0.3;

const USD_PER_CAT = 1;
const CAT_TARGET = 10_000;
const PAW_METER_MAX = 6;

function fmt(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `$${n / 1_000_000}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function fmtNum(n: number) {
  return n.toLocaleString("en-US");
}

function KalkulasiContent() {
  const { projectName } = useProjectName();
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  const dailyFee = (volume * CREATOR_FEE_PERCENT) / 100;
  const monthly = dailyFee * 30;
  const totalCats = Math.floor(monthly / USD_PER_CAT);
  const filledPaws = Math.max(
    0,
    Math.min(PAW_METER_MAX, Math.ceil((totalCats / CAT_TARGET) * PAW_METER_MAX))
  );

  return (
    <div className="px-4 pb-6 pt-2 space-y-5">
      {/* Volume display */}
      <div className="text-center">
        <p className="text-[11px] font-base text-foreground/50 mb-1">
          Daily Volume
        </p>
        <p className="text-3xl sm:text-4xl font-heading text-foreground tabular-nums">
          {fmt(volume)}
        </p>
      </div>

      {/* Volume slider */}
      <div className="relative px-1 pb-1">
        <SliderPrimitive.Root
          value={[volume]}
          onValueChange={(v) => setVolume(v[0])}
          min={MIN_VOLUME}
          max={MAX_VOLUME}
          step={STEP}
          className="relative flex w-full touch-none select-none items-center"
          aria-label="Daily trading volume"
        >
          <SliderPrimitive.Track className="relative w-full grow overflow-hidden rounded-base bg-secondary-background outline-2 outline-border h-5">
            <SliderPrimitive.Range
              className="absolute h-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--main) 0%, #f59e0b 55%, #ef4444 100%)",
              }}
            />
          </SliderPrimitive.Track>

          {/* Tick marks */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-0">
            {Array.from({ length: TICK_COUNT + 1 }, (_, i) => (
              <span
                key={i}
                className="block w-px h-3 bg-border/70"
                aria-hidden="true"
              />
            ))}
          </div>

          <SliderPrimitive.Thumb className="block h-7 w-7 rounded-full border-2 border-border bg-white transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </SliderPrimitive.Root>

        <div className="flex justify-between mt-2 text-[11px] font-base text-foreground/40">
          <span>{fmtCompact(MIN_VOLUME)}</span>
          <span>{fmtCompact(MAX_VOLUME)}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="rounded-base border-2 border-border bg-white flex divide-x-2 divide-border">
        {/* Fee / day */}
        <div className="flex-1 flex items-center gap-2 px-2.5 py-2.5">
          <div className="shrink-0 inline-flex w-7 h-7 rounded-base border border-border bg-chart-2 items-center justify-center">
            <Coins className="w-3.5 h-3.5 text-foreground" />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <p className="text-[10px] font-base text-foreground/50">Fee / Day</p>
            <p className="text-sm font-heading tabular-nums text-foreground truncate">
              {fmt(dailyFee)}
            </p>
            <p className="text-[10px] font-base text-foreground/40">
              at {CREATOR_FEE_PERCENT}%
            </p>
          </div>
        </div>

        {/* Monthly */}
        <div className="flex-1 flex items-center gap-2 px-2.5 py-2.5">
          <div className="shrink-0 inline-flex w-7 h-7 rounded-base border border-border bg-chart-3 items-center justify-center">
            <CalendarDays className="w-3.5 h-3.5 text-foreground" />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <p className="text-[10px] font-base text-foreground/50">Monthly</p>
            <p className="text-sm font-heading tabular-nums text-foreground truncate">
              {fmt(monthly)}
            </p>
            <p className="text-[10px] font-base text-foreground/40">× 30 days</p>
          </div>
        </div>

        {/* Cats */}
        <div className="flex-1 flex items-center gap-2 px-2.5 py-2.5">
          <div className="shrink-0 inline-flex w-7 h-7 rounded-base border border-border bg-main items-center justify-center">
            <PawPrint className="w-3.5 h-3.5 text-main-foreground" />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <p className="text-[10px] font-base text-foreground/50">Est. Cats</p>
            <p className="text-sm font-heading tabular-nums text-main truncate">
              {fmtNum(totalCats)}
            </p>
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: PAW_METER_MAX }, (_, i) => (
                <PawPrint
                  key={i}
                  className={cn(
                    "w-2.5 h-2.5",
                    i < filledPaws ? "text-main" : "text-border"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-[11px] font-base text-foreground/50 text-center max-w-md mx-auto">
        An estimate of creator rewards for {projectName} collected from daily
        trading volume. For full details, see the{" "}
        <a
          href="https://pump.fun/docs/fees"
          target="_blank"
          rel="noopener noreferrer"
          className="text-main underline underline-offset-2 hover:opacity-80"
        >
          pump.fun docs
        </a>
        .
      </p>
    </div>
  );
}

export function KalkulasiDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open feeding estimator"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 inline-flex items-center justify-center h-14 w-14 rounded-full border-2 border-border bg-main text-main-foreground shadow-shadow hover:scale-105 active:scale-95 transition-transform"
      >
        <PawPrint className="w-6 h-6" />
      </button>

      <Drawer open={open} onOpenChange={setOpen} direction="bottom">
        <DrawerContent>
          <DrawerHeader className="text-center sm:text-center">
            <DrawerTitle className="text-2xl">Volume & Rewards</DrawerTitle>
            <DrawerDescription className="text-foreground/60">
              Estimate the creator reward fees generated from daily trading volume.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto w-full max-w-md mx-auto">
            <KalkulasiContent />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
