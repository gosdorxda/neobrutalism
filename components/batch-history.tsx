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
import { Receipt, Camera, ExternalLink, Package, Wallet, ShoppingCart, Link2, FileCheck, Clock, CircleCheck, Cat, Soup, Info, PartyPopper, Calendar, Store, DollarSign, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getThumbPath } from "@/lib/utils";

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
  receiptImage: string;
  receiptStore: string;
  receiptItem: string;
  receiptTotal: string;
  notes: string;
  photos: string[];
};

function formatTxHash(txHash: string) {
  if (!txHash || txHash === "-") return "-";
  if (txHash.length <= 12) return txHash;
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
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
      <Alert className="!shadow-none" style={{ boxShadow: "none" }}>
        <Info />
        <AlertDescription>
          This batch is still in progress. Receipts, photos, and final data are not available yet.
        </AlertDescription>
      </Alert>
    );
  }
  if (status === "Feeding") {
    return (
      <Alert className="!shadow-none" style={{ boxShadow: "none" }}>
        <Info />
        <AlertDescription>
          This batch is currently being fed and may take some time before it is marked as completed.
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}

function ReceiptDialog({ batch }: { batch: Batch }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="reverse" size="sm" className="text-xs h-8 px-2.5">
          <Receipt className="w-3.5 h-3.5" />
          Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-lg leading-tight">{batch.name}</DialogTitle>
          <DialogDescription>
            {batch.receiptImage
              ? "Receipt proof for this batch's cat food purchase."
              : "No receipt uploaded for this batch yet."}
          </DialogDescription>
        </DialogHeader>

        <BatchStatusAlert status={batch.status} />

        <div className="space-y-4 mt-2">
          {/* Receipt Image */}
          {batch.receiptImage ? (
            <div className="space-y-2">
              <div className="relative w-full h-[200px] sm:h-[240px] border-2 border-border rounded-base overflow-hidden bg-secondary-background">
                <Image
                  src={batch.receiptImage}
                  alt="Receipt"
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
              </div>
              <a
                href={batch.receiptImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-base text-foreground/60 hover:text-main transition-colors inline-flex items-center gap-1"
              >
                View Full Image
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="relative bg-secondary-background border-2 border-border rounded-base p-6 flex items-center justify-center h-[200px] overflow-hidden">
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

          {/* Invoice Table */}
          <div className="border-2 border-border rounded-base overflow-hidden bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b-2 border-border">
              <h4 className="text-sm font-heading text-foreground">Invoice Summary</h4>
            </div>
            <table className="w-full text-xs" style={{ fontFamily: "var(--font-sans)" }}>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 font-base text-foreground/60 w-2/5 sm:w-1/3">
                    <span className="flex items-start gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3 h-3 mt-0.5 shrink-0" />
                      Date
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-heading text-foreground">{batch.targetDate || "-"}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 font-base text-foreground/60 w-2/5 sm:w-1/3">
                    <span className="flex items-start gap-1.5 whitespace-nowrap">
                      <Store className="w-3 h-3 mt-0.5 shrink-0" />
                      Store
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-heading text-foreground">{batch.receiptStore || "-"}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 font-base text-foreground/60 w-2/5 sm:w-1/3">
                    <span className="flex items-start gap-1.5 whitespace-nowrap">
                      <ShoppingCart className="w-3 h-3 mt-0.5 shrink-0" />
                      Item
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-heading text-foreground">{batch.receiptItem || "-"}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 font-base text-foreground/60 w-2/5 sm:w-1/3">
                    <span className="flex items-start gap-1.5 whitespace-nowrap">
                      <Wallet className="w-3 h-3 mt-0.5 shrink-0" />
                      Creator Rewards
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-heading text-foreground">{batch.fees}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 font-base text-foreground/60 w-2/5 sm:w-1/3">
                    <span className="flex items-start gap-1.5 whitespace-nowrap">
                      <Cat className="w-3 h-3 mt-0.5 shrink-0" />
                      Cats Fed
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-heading text-foreground">{batch.cats}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 font-base text-foreground/60 w-2/5 sm:w-1/3">
                    <span className="flex items-start gap-1.5 whitespace-nowrap">
                      <Soup className="w-3 h-3 mt-0.5 shrink-0" />
                      Food Bought
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-heading text-foreground">{batch.food}</td>
                </tr>
                <tr className={batch.notes || (batch.txHash && batch.txHash !== "-") ? "border-b border-border" : ""}>
                  <td className="px-4 py-3 font-base font-bold text-foreground w-2/5 sm:w-1/3">
                    <span className="flex items-start gap-1.5 whitespace-nowrap">
                      <DollarSign className="w-3 h-3 mt-0.5 shrink-0" />
                      Total Spent
                    </span>
                  </td>
                  <td className="px-4 py-3 font-heading font-bold text-foreground">
                    {batch.receiptTotal && batch.receiptTotal !== "$0" ? batch.receiptTotal : "-"}
                  </td>
                </tr>
                {batch.notes && (
                  <tr className={batch.txHash && batch.txHash !== "-" ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 font-base text-foreground/60 w-2/5 sm:w-1/3">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <FileText className="w-3 h-3 shrink-0" />
                        Notes
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="bg-yellow-50 border border-border rounded-base p-2.5 text-xs font-base text-foreground whitespace-pre-wrap">
                        {batch.notes}
                      </div>
                    </td>
                  </tr>
                )}
                {batch.txHash && batch.txHash !== "-" && (
                  <tr className="border-t-2 border-border">
                    <td className="px-4 py-3 font-base text-foreground/60 w-2/5 sm:w-1/3">
                      <span className="flex items-start gap-1.5 whitespace-nowrap">
                        <Link2 className="w-3 h-3 mt-0.5 shrink-0" />
                        Transaction Hash
                      </span>
                    </td>
                    <td className="px-4 py-3 font-heading text-foreground">
                      <a
                        href={`https://web3.okx.com/explorer/solana/tx/${batch.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-main underline hover:text-foreground transition-colors break-all"
                        title={batch.txHash}
                      >
                        {formatTxHash(batch.txHash)}
                      </a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
        <Button variant="reverse" size="sm" className="text-xs h-8 px-2.5">
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

        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-base text-foreground/60 bg-secondary-background border-2 border-border rounded-base p-3">
          {photoTarget > 0 && batch.photos.length >= photoTarget ? (
            <span className="flex flex-wrap items-center gap-1.5 text-chart-4">
              <PartyPopper className="w-4 h-4 shrink-0" />
              <span className="font-heading">All target reached!</span>
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
          <div className="bg-secondary-background border-2 border-border rounded-base p-8 flex flex-col items-center justify-center mt-4">
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
                  className="relative aspect-square bg-secondary-background border-2 border-border rounded-base overflow-hidden hover:border-main transition-colors group"
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

export const columns: ColumnDef<Batch>[] = [
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
    cell: ({ row }) => (
      <div className="text-base font-heading text-foreground">{row.getValue("fees")}</div>
    ),
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
    cell: ({ row }) => (
      <div className="text-base font-heading text-foreground">{row.getValue("cats")}</div>
    ),
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
    cell: ({ row }) => (
      <div className="text-base font-heading text-foreground">{row.getValue("food")}</div>
    ),
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
          <ReceiptDialog batch={batch} />
          <PhotosDialog batch={batch} />
        </div>
      );
    },
  },
];

export function BatchHistory() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");

  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await fetch("/api/batches", { cache: "no-store" });
        const data = await res.json();
        setBatches(data);
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
            Batch History
          </h2>
          <p className="text-sm font-base text-foreground/60">
            Every feeding batch is documented with receipts and photos
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
              <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-foreground transition-all ${viewMode === "list" ? "left-[calc(100%-14px)]" : "left-[2px]"}`} />
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
          <DataTable columns={columns} data={batches} />
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
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Status dot */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-main animate-pulse" />
                        ) : isFeeding ? (
                          <Soup className="w-4 h-4 text-chart-3" />
                        ) : (
                          <CircleCheck className="w-4 h-4 text-chart-4" />
                        )}
                      </div>

                      {/* Name + status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-heading text-foreground">
                            {batch.name}
                          </h3>
                          <span className={"text-xs font-heading px-1 " + (isActive ? "text-main" : isFeeding ? "text-chart-3" : "text-chart-4")}>
                            {isActive ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                In Progress
                              </span>
                            ) : (
                              batch.status
                            )}
                          </span>
</div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        <ReceiptDialog batch={batch} />
                        <PhotosDialog batch={batch} />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="px-4 pb-3">
                      <div className="flex items-center justify-between text-[10px] font-base text-foreground/50 mb-1">
                        <span>{batch.startDate}</span>
                        <span>
                          {isActive
                            ? daysLeft + "d left"
                            : isCompleted
                            ? "Completed"
                            : "Feeding"}
                        </span>
                        <span>{batch.targetDate}</span>
                      </div>
                      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <div
                          className={"h-full rounded-full transition-all duration-500 " + (isActive ? "bg-main" : isFeeding ? "bg-chart-3" : "bg-chart-4")}
                          style={{ width: progress + "%" }}
                        />
                      </div>
                    </div>

                    {/* Bottom row: stats */}
                    <div className="grid grid-cols-4 divide-x-2 divide-border border-t-2 border-border">
                      <div className="flex-1 flex items-center justify-center gap-2 py-3">
                        <Cat className="w-4 h-4 text-foreground/50" />
                        <span className="text-sm font-heading text-foreground">
                          {isActive ? "~" : batch.cats}
                        </span>
                        <span className="text-[10px] font-base text-foreground/50">cats</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 py-3">
                        <ShoppingCart className="w-4 h-4 text-foreground/50" />
                        <span className="text-sm font-heading text-foreground">
                          {isActive ? "~" : batch.food}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 py-3">
                        <DollarSign className="w-4 h-4 text-foreground/50" />
                        <span className="text-sm font-heading text-foreground">
                          {isActive ? "~" : batch.fees}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 py-3">
                        <Link2 className="w-4 h-4 text-foreground/50" />
                        {batch.txHash && batch.txHash !== "-" ? (
                          <a
                            href={`https://web3.okx.com/explorer/solana/tx/${batch.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-heading text-main underline hover:text-foreground truncate max-w-[80px]"
                          >
                            {formatTxHash(batch.txHash)}
                          </a>
                        ) : (
                          <span className="text-sm font-heading text-foreground">—</span>
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
