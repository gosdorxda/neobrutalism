"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PRESETS = [50, 100, 200, 500];

export function SettingsModal({
  open,
  onOpenChange,
  slippageBps,
  onSlippageChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slippageBps: number;
  onSlippageChange: (bps: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Slippage Tolerance</DialogTitle>
          <DialogDescription>
            The max price change you accept during the swap.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <Button
              key={p}
              type="button"
              variant={slippageBps === p ? "default" : "neutral"}
              size="sm"
              onClick={() => onSlippageChange(p)}
            >
              {p / 100}%
            </Button>
          ))}
        </div>
        <div>
          <label className="text-xs font-base text-foreground/60 block mb-1.5">
            Custom (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={(slippageBps / 100).toString()}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) {
                onSlippageChange(Math.min(10000, Math.max(0, Math.round(v * 100))));
              }
            }}
            className="w-full bg-secondary-background border-2 border-border rounded-base px-3 py-2 text-sm font-base text-foreground outline-none focus:border-main"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
