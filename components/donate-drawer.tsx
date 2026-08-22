"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function DonateDrawer({
  wallet,
  projectName,
  className,
}: {
  wallet: string;
  projectName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  const solanaUrl = `solana:${wallet}?label=${encodeURIComponent(
    projectName
  )}&message=Donation%20to%20${encodeURIComponent(projectName)}`;

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(solanaUrl, {
      width: 256,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [open, solanaUrl]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <Button
        variant="reverse"
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        Donate
      </Button>

      <Drawer open={open} onOpenChange={setOpen} direction="bottom">
        <DrawerContent>
          <DrawerHeader className="text-center sm:text-center">
            <DrawerTitle className="text-2xl">Donate to {projectName}</DrawerTitle>
            <DrawerDescription className="text-foreground/60">
              Scan with a Solana wallet to send a donation.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto w-full max-w-md mx-auto px-4 pb-6">
            <div className="flex flex-col items-center gap-4">
              {qr ? (
                <div className="w-52 h-52 border-2 border-border rounded-base bg-white p-2 shadow-shadow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="Donate QR code" className="w-full h-full" />
                </div>
              ) : (
                <div className="w-52 h-52 border-2 border-border rounded-base bg-secondary-background flex items-center justify-center text-xs font-base text-foreground/40">
                  Generating QR...
                </div>
              )}

              <p className="text-[11px] font-base text-foreground/50">
                Supports SOL &amp; SPL tokens via Solana Pay
              </p>

              <div className="w-full flex items-center gap-2 rounded-base border border-border bg-secondary-background/30 p-1.5">
                <code className="flex-1 text-[11px] font-mono text-foreground/70 truncate text-left">
                  {wallet}
                </code>
                <Button
                  variant="noShadow"
                  size="sm"
                  className="h-7 w-7 p-0 bg-zinc-100 text-foreground hover:bg-zinc-200 border border-border"
                  onClick={copy}
                  aria-label="Copy wallet address"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-chart-4" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
