"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImpactCard } from "./ImpactCard";
import { useProjectName } from "@/components/project-name-provider";
import { toPng } from "html-to-image";
import type { ImpactData } from "@/lib/helius";
import { Search, Share2, Download, Loader2 } from "lucide-react";

export function ImpactDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { projectName } = useProjectName();
  const [open, setOpen] = useState(false);
  const [wallet, setWallet] = useState("");
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  async function check() {
    setError(null);
    setData(null);
    if (!wallet.trim()) {
      setError("Enter a wallet address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/impact?wallet=${encodeURIComponent(wallet.trim())}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to fetch impact.");
      } else {
        setData(json as ImpactData);
      }
    } catch {
      setError("Network error. Try again.");
    }
    setLoading(false);
  }

  async function downloadImage() {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${projectName}-impact.png`;
      a.click();
    } catch {
      setError("Failed to generate image.");
    }
  }

  function shareX() {
    if (!data) return;
    const text = `I've helped feed ${data.cats} street cats through my ${projectName} trades. Every swap fills a bowl. 🐱`;
    const url = `${window.location.origin}/impact/${data.wallet}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  }

  function reset() {
    setData(null);
    setWallet("");
    setError(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="lg">
            Check Your Impact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Impact</DialogTitle>
          <DialogDescription>
            Enter your Solana wallet address to see how many cats your trades have
            helped feed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Solana wallet address"
            className="text-sm font-mono"
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
          />
          <Button
            onClick={check}
            disabled={loading}
            size="icon"
            className="shrink-0"
            aria-label="Check impact"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {error && (
          <p className="text-xs font-base text-red-600 px-3 py-2 rounded-base border-2 border-red-600/30 bg-red-600/5">
            {error}
          </p>
        )}

        {data && (
          <div className="space-y-3">
            <ImpactCard ref={cardRef} data={data} projectName={projectName} />
            <div className="flex gap-2">
              {data.cats > 0 && (
                <Button
                  onClick={shareX}
                  variant="neutral"
                  size="sm"
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4" /> Share to X
                </Button>
              )}
              <Button
                onClick={downloadImage}
                variant="neutral"
                size="sm"
                className="flex-1"
              >
                <Download className="w-4 h-4" /> Save image
              </Button>
            </div>
            <p className="text-[11px] font-base text-foreground/40 text-center leading-relaxed">
              {data.cats > 0
                ? `Based on your recent ${data.txCount} token transactions via Helius. Creator fee ${data.feeBps / 100}%. Estimated at realized trade value.`
                : `No ${projectName} trades detected for this wallet via Helius. Creator fee ${data.feeBps / 100}%.`}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
