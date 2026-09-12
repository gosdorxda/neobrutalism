"use client";

import { formatTxHash } from "@/lib/utils";
import { Printer, Receipt as ReceiptIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export type BatchEssentials = {
  name: string;
  price: string;
  tx: string;
};

export type InvoiceBatch = {
  id: number;
  name: string;
  status: string;
  startDate: string;
  targetDate: string;
  fees: string;
  feesUsd?: string;
  cats: string;
  food: string;
  txHash: string;
  receiptImages: string[];
  receiptStore: string;
  receiptItem: string;
  receiptTotal: string;
  notes: string;
  essentials: BatchEssentials[];
};

export type InvoiceSettings = {
  projectName: string;
};

export function getInvoiceCode(batch: Pick<InvoiceBatch, "id">): string {
  return `RCP-${String(batch.id).padStart(3, "0")}`;
}

function InvoiceRows({ batch }: { batch: InvoiceBatch }) {
  const essentials = Array.isArray(batch.essentials) ? batch.essentials : [];
  const foodCost = Number((batch.receiptTotal || "").replace(/[^0-9.]/g, "")) || 0;
  const essentialsSubtotal = essentials.reduce(
    (sum, e) => sum + (Number((e.price || "").replace(/[^0-9.]/g, "")) || 0),
    0
  );
  const grandTotal = foodCost + essentialsSubtotal;
  const hasEssentials = essentials.length > 0;
  const fmtUsd = (num: number) => (num > 0 ? `$${num} USD` : "-");

  const BORDER_COLORS = ["#ff8e3a", "#FFBF00", "#7A83FF", "#0099FF"];
  const GREEN = "#00D696";

  return (
    <div className="border border-border overflow-hidden print:shadow-none" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
      <table className="w-full border-collapse text-xs sm:text-sm">
        <tbody>
          <tr className="border-b border-border">
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 font-base text-foreground/60 border-r border-border border-l-2" style={{ borderLeftColor: BORDER_COLORS[0] }}>Item</td>
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 text-right font-heading text-foreground">{batch.receiptItem || "~"}</td>
          </tr>
          <tr className="border-b border-border">
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 font-base text-foreground/60 border-r border-border border-l-2" style={{ borderLeftColor: BORDER_COLORS[0] }}>Store</td>
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 text-right font-heading text-foreground">{batch.receiptStore || "~"}</td>
          </tr>
          <tr className="border-b border-border">
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 font-base text-foreground/60 border-r border-border border-l-2" style={{ borderLeftColor: BORDER_COLORS[0] }}>Food Bought</td>
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 text-right font-heading text-foreground">{batch.status === "In Progress" || batch.status === "Feeding" ? "~" : batch.food}</td>
          </tr>
          <tr className={hasEssentials ? "border-b border-border" : "bg-zinc-100"}>
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 font-base text-foreground/60 border-r border-border border-l-2" style={{ borderLeftColor: BORDER_COLORS[0] }}>Food Purchase</td>
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 text-right font-heading text-foreground">{fmtUsd(foodCost)}</td>
          </tr>
          {batch.txHash && batch.txHash !== "-" && (
            <tr className="border-b border-border">
              <td className="py-1.5 px-2 sm:py-2 sm:px-3 font-base text-foreground/60 border-r border-border border-l-2" style={{ borderLeftColor: BORDER_COLORS[0] }}>Tx</td>
              <td className="py-1.5 px-2 sm:py-2 sm:px-3 text-right">
                <a
                  href={`https://web3.okx.com/explorer/solana/tx/${batch.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading text-main underline hover:text-foreground transition-colors break-all"
                  title={batch.txHash}
                >
                  {formatTxHash(batch.txHash)}
                </a>
              </td>
            </tr>
          )}
          {hasEssentials && (
            <>
              {essentials.map((e, i) => {
                const txHref =
                  e.tx && e.tx !== "-"
                    ? e.tx.startsWith("http")
                      ? e.tx
                      : `https://web3.okx.com/explorer/solana/tx/${e.tx}`
                    : "";
                const borderColor = BORDER_COLORS[(i + 1) % BORDER_COLORS.length];
                return (
                  <tr key={`ess-${i}`} className="border-b border-border">
                    <td className="py-1 px-2 sm:py-1.5 sm:px-3 font-base text-foreground/40 border-r border-border border-l-2 text-xs align-top" style={{ borderLeftColor: borderColor }}>
                      <span className="inline-flex flex-wrap items-center gap-1.5">
                        <span>#{i + 1}</span>
                        <span>{e.name || "~"}</span>
                        {txHref && (
                          <a
                            href={txHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-main underline hover:text-foreground transition-colors"
                            title={e.tx}
                          >
                            tx
                          </a>
                        )}
                      </span>
                    </td>
                    <td className="py-1 px-2 sm:py-1.5 sm:px-3 text-right font-base text-foreground/60 text-xs align-top">
                      {e.price && e.price !== "$0" ? e.price : "-"}
                    </td>
                  </tr>
                );
              })}
            </>
          )}
          <tr className="bg-zinc-100">
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 font-heading text-foreground border-r border-b border-border border-l-2 border-l-border">Total</td>
            <td className="py-1.5 px-2 sm:py-2 sm:px-3 text-right font-heading text-foreground border-b border-border">{fmtUsd(grandTotal)}</td>
          </tr>
          {(() => {
            const usdNum = batch.feesUsd && batch.feesUsd !== "0" && batch.feesUsd !== "$0"
              ? Number(batch.feesUsd.replace(/[^0-9.]/g, "")) || 0 : 0;
            const remaining = Math.max(0, usdNum - grandTotal);
            if (remaining <= 0) return null;
            return (
              <tr>
                <td className="py-1.5 px-2 sm:py-2 sm:px-3 font-base text-foreground border-r border-border border-l-2" style={{ borderLeftColor: GREEN }}>Remaining</td>
                <td className="py-1.5 px-2 sm:py-2 sm:px-3 text-right font-base text-foreground">${remaining.toFixed(2)}</td>
              </tr>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
}

const SEGMENT_COLORS = ["bg-main", "bg-chart-3", "bg-chart-5", "bg-chart-2"];

function FundsRaisedBar({ batch }: { batch: InvoiceBatch }) {
  const feesNum = batch.fees ? Number(batch.fees.replace(/[^0-9.]/g, "")) || 0 : 0;
  const usdNum = batch.feesUsd && batch.feesUsd !== "0" && batch.feesUsd !== "$0"
    ? Number(batch.feesUsd.replace(/[^0-9.]/g, "")) || 0
    : 0;
  const isOldFormat = batch.fees && batch.fees.trim().startsWith("$");

  const purchaseNum = batch.receiptTotal ? Number(batch.receiptTotal.replace(/[^0-9.]/g, "")) || 0 : 0;
  const essentials = (batch.essentials || []).filter((e) => e.price && Number(e.price.replace(/[^0-9.]/g, "")) > 0);
  const essentialsNum = essentials.reduce((sum, e) => sum + (Number(e.price.replace(/[^0-9.]/g, "")) || 0), 0);
  const totalPurchase = purchaseNum + essentialsNum;
  const remainingNum = Math.max(0, usdNum - totalPurchase);

  const segments: { label: string; value: number; color: string }[] = [];
  if (purchaseNum > 0) segments.push({ label: "Food", value: purchaseNum, color: SEGMENT_COLORS[0] });
  essentials.forEach((e, i) => {
    segments.push({ label: e.name || `Item ${i + 1}`, value: Number(e.price.replace(/[^0-9.]/g, "")) || 0, color: SEGMENT_COLORS[(i + 1) % SEGMENT_COLORS.length] });
  });
  if (remainingNum > 0) segments.push({ label: "Remaining", value: remainingNum, color: "bg-chart-4" });

  const totalForPct = usdNum || totalPurchase;

  return (
    <div className="bg-secondary-background border border-border rounded-base px-4 py-3 mb-3" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-heading text-foreground/60 uppercase tracking-wide">Funds Raised</span>
        {batch.status === "In Progress" || batch.status === "Feeding" ? (
          <span className="text-lg font-heading text-main">~</span>
        ) : (
          <span className="text-lg font-heading text-main">
            <span style={{ background: "linear-gradient(90deg,#5a9a0c 34.62%,#009970)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isOldFormat ? batch.fees : `${feesNum} SOL`}
            </span>{" "}
            {usdNum > 0 && <span className="text-[10px] font-base text-foreground/40">(${usdNum.toFixed(2)})</span>}
          </span>
        )}
      </div>

      {totalForPct > 0 && segments.length > 0 && (
        <div className="space-y-2">
          <div className="flex h-6 overflow-hidden rounded-base border border-border" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
            {segments.map((seg, i) => {
              const pct = totalForPct > 0 ? (seg.value / totalForPct) * 100 : 0;
              return (
                <div
                  key={i}
                  className={"flex items-center justify-center border-r border-border last:border-r-0 " + seg.color + (seg.color === "bg-chart-4" ? " text-black" : " text-white")}
                  style={{ width: `${pct}%`, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-base">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className={"h-2.5 w-2.5 rounded-sm " + seg.color}></span>
                <span className="text-foreground/60">{seg.label}</span>
                <span className="font-heading text-foreground">${seg.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getReceiptImages(batch: InvoiceBatch): string[] {
  if (Array.isArray(batch.receiptImages) && batch.receiptImages.length > 0) return batch.receiptImages;
  const legacy = (batch as unknown as { receiptImage?: string }).receiptImage;
  return legacy ? [legacy] : [];
}

function ReceiptPhotoModal({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);
  const hasMultiple = images.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative max-h-[90vh] w-auto max-w-3xl" onClick={(e) => e.stopPropagation()}>
        {hasMultiple && (
          <>
            <button type="button" onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border-2 border-white bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/40">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setIndex((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border-2 border-white bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/40">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <Image src={images[index]} alt="Receipt" width={800} height={1000} className="max-h-[85vh] w-auto rounded-base object-contain" unoptimized />
      </div>
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full border-2 border-white bg-white/20 p-2 text-white backdrop-blur hover:bg-white/40">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function InvoiceMeta({ batch, actionLink }: { batch: InvoiceBatch; actionLink?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 w-full">
      <p className="text-xs font-base text-foreground/60 leading-none">
        <span className="font-heading text-foreground/80">Notes:</span>{" "}
        <span className="italic">{batch.notes || "~"}</span>
      </p>
      {actionLink && <div className="shrink-0 leading-none">{actionLink}</div>}
    </div>
  );
}

export function InvoiceView({
  batch,
  settings,
  showPrintButton = false,
}: {
  batch: InvoiceBatch;
  settings: InvoiceSettings;
  showPrintButton?: boolean;
}) {
  const invoiceCode = getInvoiceCode(batch);

  return (
    <div className="bg-secondary-background border-2 border-border rounded-base overflow-hidden print:bg-white" style={{ fontFamily: "var(--font-mono-roboto)", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
      <div className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
        {/* Header */}
        <div className="text-center pb-4 border-b-2 border-dashed border-border">
          <h3 className="text-xl sm:text-2xl font-heading text-foreground">Receipt #{invoiceCode}</h3>
          <p className="text-xs font-base text-foreground/50 mt-1">Issued by {settings.projectName || "CATFUND"}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-[10px] font-base text-foreground/50">
            {batch.startDate && batch.targetDate && (
              <span>Period: {batch.startDate} - {batch.targetDate}</span>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mt-5">
          <FundsRaisedBar batch={batch} />
          <InvoiceRows batch={batch} />
        </div>

        {/* Meta */}
        <div className="mt-4">
          <InvoiceMeta batch={batch} actionLink={undefined} />
        </div>

        {/* Footer */}
        {showPrintButton && (
          <div className="mt-5 pt-4 border-t border-border flex justify-center print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-base bg-secondary-background text-sm font-base text-foreground hover:bg-zinc-100 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function InvoiceCompactView({
  batch,
  actionLink,
}: {
  batch: InvoiceBatch;
  actionLink?: React.ReactNode;
}) {
  const invoiceCode = getInvoiceCode(batch);
  const receiptImages = getReceiptImages(batch);
  const [showPhotos, setShowPhotos] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {receiptImages.length > 0 && (
        <div className="mb-2">
          <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-center gap-1.5 rounded-base border-2 border-border bg-white px-3 py-2 text-[10px] font-heading text-foreground transition-colors hover:bg-zinc-100">
            <ReceiptIcon className="h-3.5 w-3.5 text-main" />
            {expanded ? "Hide Receipt Photos" : `View Receipt Photos (${receiptImages.length})`}
          </button>
        </div>
      )}
      {expanded && receiptImages.length > 0 && (
        <div className="mb-3">
          {receiptImages.length === 1 ? (
            <a href={receiptImages[0]} target="_blank" rel="noopener noreferrer" className="block h-48 overflow-hidden rounded-base border-2 border-border bg-secondary-background">
              <Image src={receiptImages[0]} alt="Receipt 1" width={500} height={200} className="h-full w-full object-contain" unoptimized />
            </a>
          ) : (
            <div className="relative h-48 overflow-hidden rounded-base border-2 border-border bg-secondary-background">
              <div className="flex h-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${photoIndex * 100}%)` }}>
                {receiptImages.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block h-full w-full shrink-0">
                    <Image src={img} alt={`Receipt ${i + 1}`} width={500} height={200} className="h-full w-full object-contain" unoptimized />
                  </a>
                ))}
              </div>
              <button type="button" onClick={() => setPhotoIndex((i) => (i - 1 + receiptImages.length) % receiptImages.length)} className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-base border border-border bg-white/80 p-1.5 backdrop-blur hover:bg-white transition-colors">
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <button type="button" onClick={() => setPhotoIndex((i) => (i + 1) % receiptImages.length)} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-base border border-border bg-white/80 p-1.5 backdrop-blur hover:bg-white transition-colors">
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
              <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-base text-white backdrop-blur">
                {photoIndex + 1} / {receiptImages.length}
              </div>
            </div>
          )}
        </div>
      )}
    <div className="bg-secondary-background border-2 border-border rounded-base overflow-hidden print:bg-white" style={{ fontFamily: "var(--font-mono-roboto)", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="text-center pb-3 border-b-2 border-dashed border-border">
          <h3 className="text-base font-heading text-foreground">Receipt #{invoiceCode}</h3>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1 text-[10px] font-base text-foreground/50">
            {batch.startDate && batch.targetDate && (
              <span>Period: {batch.startDate} - {batch.targetDate}</span>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mt-3">
          <FundsRaisedBar batch={batch} />
          <InvoiceRows batch={batch} />
        </div>

        {/* Meta */}
        <div className="mt-3">
          <InvoiceMeta batch={batch} actionLink={actionLink} />
        </div>
      </div>

      {showPhotos && receiptImages.length > 0 && (
        <ReceiptPhotoModal images={receiptImages} startIndex={photoIndex} onClose={() => setShowPhotos(false)} />
      )}
    </div>
    </>
  );
}
