"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { Receipt, Camera, ExternalLink, Package, Wallet, ShoppingCart, Link2, FileCheck, Clock, CircleCheck, Cat, Soup, Info, PartyPopper, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getThumbPath, formatTxHash } from "@/lib/utils";
import { InvoiceCompactView, getInvoiceCode, type InvoiceBatch, type InvoiceSettings, type BatchEssentials } from "./invoice";

type Batch = {
  id: number;
  name: string;
  status: string;
  startDate: string;
  targetDate: string;
  fees: string;
  cats: string;
  food: string;
  txHash: string;
  isActive: boolean;
  receiptImages: string[];
  receiptStore: string;
  receiptItem: string;
  receiptTotal: string;
  notes: string;
  photos: string[];
  essentials: BatchEssentials[];
};

function getReceiptImages(batch: Batch): string[] {
  const legacy = (batch as unknown as { receiptImage?: string }).receiptImage;
  if (Array.isArray(batch.receiptImages) && batch.receiptImages.length > 0) {
    return batch.receiptImages;
  }
  if (legacy) {
    return [legacy];
  }
  return [];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "In Progress";
  const isFeeding = status === "Feeding";
  return (
    <div
      className={"inline-flex items-center gap-1.5 text-xs font-heading " + (isActive ? "text-main" : isFeeding ? "text-chart-3" : "text-chart-4")}
    >
      {isActive ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFeeding ? (
        <Soup className="w-3.5 h-3.5" />
      ) : (
        <CircleCheck className="w-3.5 h-3.5" />
      )}
      {status}
    </div>
  );
}

function getStatusWatermarkColor(status: string): string {
  if (status === "In Progress") return "text-main/40";
  if (status === "Feeding") return "text-chart-1/40";
  return "text-chart-4/40";
}

function BatchStatusAlert({ status }: { status: string }) {
  if (status === "In Progress") {
    return (
      <Alert className="!shadow-none border py-2" style={{ boxShadow: "none" }}>
        <Info />
        <AlertDescription>
          This batch is still in progress. Receipts, photos, and final data are not available yet.
        </AlertDescription>
      </Alert>
    );
  }
  if (status === "Feeding") {
    return (
      <Alert className="!shadow-none border py-2" style={{ boxShadow: "none" }}>
        <Info />
        <AlertDescription>
          Feeding is currently in progress for this batch. It may take some time before it is marked as completed.
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}

function ReceiptDialog({ batch, settings }: { batch: Batch; settings: InvoiceSettings }) {
  const receiptImages = getReceiptImages(batch);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasReceipts = receiptImages.length > 0;
  const hasMultiple = receiptImages.length > 1;

  function nextImage() {
    setCurrentIndex((prev) => (prev + 1) % receiptImages.length);
  }

  function prevImage() {
    setCurrentIndex((prev) => (prev - 1 + receiptImages.length) % receiptImages.length);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="noShadow" size="sm" className="text-xs h-8 px-2.5 bg-zinc-100 text-foreground hover:bg-zinc-200 border">
          <Receipt className="w-3.5 h-3.5" />
          Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-lg leading-tight">{batch.name}</DialogTitle>
          <DialogDescription>
            {hasReceipts
              ? `Receipt proof for this batch's cat food purchase. ${receiptImages.length} image${receiptImages.length > 1 ? "s" : ""} available.`
              : "No receipt uploaded for this batch yet."}
          </DialogDescription>
        </DialogHeader>

        <BatchStatusAlert status={batch.status} />

        <div className="space-y-4 mt-2">
          {/* Receipt Image Carousel */}
          {hasReceipts ? (
            <div className="space-y-2">
              <div className="relative w-full h-[200px] sm:h-[240px] border border-border rounded-base overflow-hidden bg-secondary-background">
                <Image
                  src={receiptImages[currentIndex]}
                  alt={`Receipt ${currentIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-contain"
                  unoptimized
                />
                {/* Status Watermark */}
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl font-heading font-black uppercase tracking-widest rotate-[-12deg] select-none pointer-events-none whitespace-nowrap ${getStatusWatermarkColor(batch.status)}`}
                >
                  {batch.status}
                </div>

                {/* Navigation Arrows */}
                {hasMultiple && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-border shadow-sm flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Previous receipt"
                    >
                      <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-border shadow-sm flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Next receipt"
                    >
                      <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between">
                <a
                  href={receiptImages[currentIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-base text-foreground/60 hover:text-main transition-colors inline-flex items-center gap-1"
                >
                  View Full Image
                  <ExternalLink className="w-3 h-3" />
                </a>
                {hasMultiple && (
                  <span className="text-xs font-base text-foreground/60">
                    {currentIndex + 1} / {receiptImages.length}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="relative bg-secondary-background border border-border rounded-base p-6 flex items-center justify-center h-[200px] overflow-hidden">
              {/* Status Watermark */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl font-heading font-black uppercase tracking-widest rotate-[-12deg] select-none pointer-events-none whitespace-nowrap ${getStatusWatermarkColor(batch.status)}`}
              >
                {batch.status}
              </div>
              <div className="text-center relative z-10">
                <Receipt className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                <span className="text-sm font-base text-foreground/50">No receipt uploaded yet</span>
              </div>
            </div>
          )}

          {/* Invoice */}
          <InvoiceCompactView
            batch={{
              id: batch.id,
              name: batch.name,
              status: batch.status,
              startDate: batch.startDate,
              targetDate: batch.targetDate,
              fees: batch.fees,
              cats: batch.cats,
              food: batch.food,
              txHash: batch.txHash,
              receiptImages: getReceiptImages(batch),
              receiptStore: batch.receiptStore,
              receiptItem: batch.receiptItem,
              receiptTotal: batch.receiptTotal,
              notes: batch.notes,
              essentials: batch.essentials || [],
            }}
            actionLink={
              <a
                href={`/receipt/${getInvoiceCode(batch)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-base text-main underline hover:text-foreground transition-colors"
              >
                View Full Receipt
                <ExternalLink className="w-3 h-3" />
              </a>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PhotosDialog({ batch }: { batch: Batch }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const visiblePhotos = batch.photos.slice(0, visibleCount);
  const hasMore = visibleCount < batch.photos.length;
  const photoTarget = Number(batch.cats.replace(/[^0-9.]/g, "")) || 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="noShadow" size="sm" className="text-xs h-8 px-2.5 bg-zinc-100 text-foreground hover:bg-zinc-200 border">
          <Camera className="w-3.5 h-3.5" />
          Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{batch.name} - Cat Photos</DialogTitle>
          <DialogDescription>
            {batch.photos.length === 0
              ? "No feeding photos uploaded for this batch yet."
              : `Every cat gets photographed during feeding. ${batch.photos.length} photos total.`}
          </DialogDescription>
        </DialogHeader>

        <BatchStatusAlert status={batch.status} />

        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-base text-foreground/60 bg-secondary-background border border-border rounded-base p-3">
          {photoTarget > 0 && batch.photos.length >= photoTarget ? (
            <span className="flex flex-wrap items-center gap-1.5 text-chart-4">
              <PartyPopper className="w-4 h-4 shrink-0" />
              <span className="font-heading">All cats photographed!</span>
              <span>Every cat in this batch has been photographed and fed.</span>
            </span>
          ) : (
            <>
              <span>
                <span className="font-heading text-foreground">{batch.photos.length}</span>{" "}
                of <span className="font-heading text-foreground">{photoTarget}</span> cats photographed
              </span>
              {photoTarget > 0 && (
                <>
                  <span className="hidden sm:inline text-foreground/30">|</span>
                  <span>
                    <span className="font-heading text-foreground">{Math.max(0, photoTarget - batch.photos.length)}</span>{" "}
                    remaining
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {batch.photos.length === 0 ? (
          <div className="bg-secondary-background border border-border rounded-base p-8 flex flex-col items-center justify-center mt-4">
            <Camera className="w-12 h-12 text-foreground/30 mb-3" />
            <p className="text-sm font-base text-foreground/50">No photos uploaded yet</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {visiblePhotos.map((photo, i) => (
                <a
                  key={i}
                  href={photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square bg-secondary-background border border-border rounded-base overflow-hidden hover:border-main transition-colors group"
                >
                  <Image
                    src={getThumbPath(photo)}
                    alt={`Cat ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px"
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="neutral"
                  size="sm"
                  className="bg-zinc-100 text-foreground hover:bg-zinc-200 border"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                >
                  Load {Math.min(batch.photos.length - visibleCount, 12)} More
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getColumns(settings: InvoiceSettings): ColumnDef<Batch>[] {
  return [
  {
    accessorKey: "batch",
    header: () => (
      <div className="flex items-center gap-1.5">
        <Package className="w-3.5 h-3.5" />
        <span>Batch</span>
      </div>
    ),
    cell: ({ row }) => {
      const batch = row.original;
      return (
        <div>
          <div className="text-base font-heading text-foreground">{batch.name}</div>
          <div className="text-[10px] font-base text-foreground/60 mt-1 hidden sm:block">
            {batch.startDate} - {batch.targetDate}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        <span>Status</span>
      </div>
    ),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "fees",
    header: () => (
      <div className="flex items-center gap-1.5">
        <Wallet className="w-3.5 h-3.5" />
        <span>Rewards</span>
      </div>
    ),
    meta: { className: "hidden md:table-cell" },
    cell: ({ row }) => {
      const batch = row.original;
      return (
        <div className="text-base font-heading text-foreground">
          {batch.status === "In Progress" || batch.status === "Feeding" ? "~" : row.getValue("fees")}
        </div>
      );
    },
  },
  {
    accessorKey: "cats",
    header: () => (
      <div className="flex items-center gap-1.5">
        <Cat className="w-4 h-4" />
        <span>Cats</span>
      </div>
    ),
    meta: { className: "hidden md:table-cell" },
    cell: ({ row }) => {
      const batch = row.original;
      return (
        <div className="text-base font-heading text-foreground">
          {batch.status === "In Progress" || batch.status === "Feeding" ? "~" : row.getValue("cats")}
        </div>
      );
    },
  },
  {
    accessorKey: "food",
    header: () => (
      <div className="flex items-center gap-1.5">
        <ShoppingCart className="w-3.5 h-3.5" />
        <span>Food</span>
      </div>
    ),
    meta: { className: "hidden lg:table-cell" },
    cell: ({ row }) => {
      const batch = row.original;
      return (
        <div className="text-base font-heading text-foreground">
          {batch.status === "In Progress" || batch.status === "Feeding" ? "~" : row.getValue("food")}
        </div>
      );
    },
  },
  {
    accessorKey: "txHash",
    header: () => (
      <div className="flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5" />
        <span>Tx</span>
      </div>
    ),
    meta: { className: "hidden xl:table-cell" },
    cell: ({ row }) => {
      const txHash = row.getValue("txHash") as string;
      return txHash && txHash !== "-" ? (
        <a
          href={`https://web3.okx.com/explorer/solana/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-base text-main underline hover:text-foreground transition-colors"
          title={txHash}
        >
          {formatTxHash(txHash)}
        </a>
      ) : (
        <span className="text-xs font-base text-foreground/40">-</span>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <div className="flex items-center gap-1.5">
        <FileCheck className="w-3.5 h-3.5" />
        <span>Proofs</span>
      </div>
    ),
    cell: ({ row }) => {
      const batch = row.original;
      return (
        <div className="flex items-center gap-2">
          <ReceiptDialog batch={batch} settings={settings} />
          <PhotosDialog batch={batch} />
        </div>
      );
    },
  },
  ];
}

export function BatchHistory() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [settings, setSettings] = useState<InvoiceSettings>({ projectName: "CATFUND" });

  useEffect(() => {
    async function loadBatches() {
      try {
        const [batchesRes, settingsRes] = await Promise.all([
          fetch("/api/batches", { cache: "no-store" }),
          fetch("/api/settings", { cache: "no-store" }),
        ]);
        const data = await batchesRes.json();
        const settingsData = await settingsRes.json().catch(() => ({}));
        setBatches(data);
        setSettings({ projectName: settingsData.projectName || "CATFUND" });
      } catch {
        setBatches([]);
      }
      setLoading(false);
    }
    loadBatches();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="batches" className="w-full bg-background py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-heading text-foreground mb-3">
            Impact History
          </h2>
          <p className="text-sm font-base text-foreground/60">
            Every feeding batch is documented with receipts and photos.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "table" : "list")}
            className="inline-flex items-center gap-2 font-base text-xs text-foreground/50 hover:text-foreground transition-colors"
          >
            <span className={viewMode === "list" ? "text-foreground font-heading" : ""}>
              List
            </span>
            <div className={`relative w-7 h-4 rounded-full border border-border transition-colors ${viewMode === "list" ? "bg-main" : "bg-foreground/10"}`}>
              <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground transition-all ${viewMode === "list" ? "left-[calc(100%-14px)]" : "left-[2px]"}`} />
            </div>
            <span className={viewMode === "table" ? "text-foreground font-heading" : ""}>
              Table
            </span>
          </button>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm font-base text-foreground/50">Loading batches...</p>
          </div>
        ) : viewMode === "table" ? (
          <DataTable columns={getColumns(settings)} data={batches} />
        ) : null}

        {/* Improved Card List View */}
        {!loading && viewMode === "list" && batches.length > 0 && (
          <div>
            <div className="space-y-3">
              {batches.map((batch) => {
                const isActive = batch.status === "In Progress";
                const isFeeding = batch.status === "Feeding";
                const isCompleted = batch.status === "Completed";
                const statusColor = isActive
                  ? "bg-chart-2"
                  : isFeeding
                  ? "bg-chart-3"
                  : "bg-chart-4";
                const statusTextColor = isActive
                  ? "text-chart-2"
                  : isFeeding
                  ? "text-chart-3"
                  : "text-chart-4";

                const startDate = new Date(batch.startDate).getTime();
                const targetDate = new Date(batch.targetDate).getTime();
                const totalDuration = targetDate - startDate;
                const progress = !isActive
                  ? 100
                  : totalDuration > 0 && now > 0
                  ? Math.min(99, Math.max(1, Math.round((1 - (targetDate - now) / totalDuration) * 100)))
                  : 50;

                const daysLeft = totalDuration > 0 && now > 0
                  ? Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)))
                  : 0;

                return (
                  <div
                    key={batch.id}
                    className="border-2 border-border rounded-base bg-white overflow-hidden"
                  >
                    {/* Top row: name + status + actions */}
                    <div className="flex items-center gap-2 px-4 py-3">
                      {/* Batch icon */}
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-foreground" />

                      {/* Name + status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-base sm:text-lg font-heading text-foreground truncate">
                            {batch.name}
                          </h3>
                          <span className={"text-[10px] font-heading px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 " + (isActive ? "bg-main/10 text-main" : isFeeding ? "bg-chart-3/10 text-chart-3" : "bg-chart-4/10 text-chart-4")}>
                            {isActive ? (
                              <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isFeeding ? (
                              <Soup className="w-3 h-3" />
                            ) : (
                              <CircleCheck className="w-3 h-3" />
                            )}
                            {isActive ? "In Progress" : batch.status}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        <ReceiptDialog batch={batch} settings={settings} />
                        <PhotosDialog batch={batch} />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="px-4 pb-3">
                      <div className="flex items-center justify-between text-[10px] font-base text-foreground/50 mb-1">
                        <span>{formatDate(batch.startDate)}</span>
                        <span>{progress}%</span>
                        <span>{formatDate(batch.targetDate)}</span>
                      </div>
                      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <div
                          className={"h-full rounded-full transition-all duration-500 " + (isActive ? "bg-main" : isFeeding ? "bg-chart-3" : "bg-chart-4")}
                          style={{ width: progress + "%" }}
                        />
                      </div>
                    </div>

                    {/* Bottom row: stats */}
                    <div className="grid grid-cols-4 divide-x divide-border/40 border-t-2 border-border">
                      <div className="flex flex-col items-center justify-center gap-1 py-3">
                        <span className="text-[9px] font-base text-foreground/40 uppercase tracking-wider flex items-center gap-1">
                          <Cat className="w-3 h-3" />
                          Cats
                        </span>
                        <span className="text-sm font-heading text-foreground">
                          {isActive || isFeeding ? "~" : batch.cats}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 py-3">
                        <span className="text-[9px] font-base text-foreground/40 uppercase tracking-wider flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          Food
                        </span>
                        <span className="text-sm font-heading text-foreground">
                          {isActive || isFeeding ? "~" : batch.food}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 py-3">
                        <span className="text-[9px] font-base text-foreground/40 uppercase tracking-wider flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Rewards
                        </span>
                        <span className="text-sm font-heading text-foreground">
                          {isActive || isFeeding ? "~" : batch.fees}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 py-3">
                        <span className="text-[9px] font-base text-foreground/40 uppercase tracking-wider flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          Tx
                        </span>
                        {batch.txHash && batch.txHash !== "-" ? (
                          <a
                            href={`https://web3.okx.com/explorer/solana/tx/${batch.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-base text-main underline hover:text-foreground truncate max-w-[80px]"
                          >
                            {formatTxHash(batch.txHash)}
                          </a>
                        ) : (
                          <span className="text-xs font-base text-foreground/40">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
