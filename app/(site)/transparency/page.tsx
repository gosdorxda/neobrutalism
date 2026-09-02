import { getBatches, getStats, type Batch } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { formatUsd, formatTxHash } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";
import { Receipt, Camera, ExternalLink, PawPrint, Package, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

async function fetchSolBalance(wallet: string): Promise<number | null> {
  try {
    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [wallet] }),
      next: { revalidate: 30 },
    });
    const data = await res.json();
    const lamports = data?.result?.value;
    if (typeof lamports === "number") return lamports / 1_000_000_000;
    return null;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: "Transparency",
  description:
    "Every batch, documented end to end. Receipts, photos, and on-chain records for every feeding.",
};

function getReceiptImages(batch: Batch): string[] {
  const legacy = (batch as unknown as { receiptImage?: string }).receiptImage;
  if (Array.isArray(batch.receiptImages) && batch.receiptImages.length > 0) {
    return batch.receiptImages;
  }
  if (legacy) return [legacy];
  return [];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr || "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "In Progress";
  const isFeeding = status === "Feeding";
  const color = isActive
    ? "bg-main/10 text-main"
    : isFeeding
    ? "bg-chart-3/10 text-chart-3"
    : "bg-chart-4/10 text-chart-4";
  return (
    <span className={`text-[10px] font-heading px-2 py-0.5 rounded-full shrink-0 ${color}`}>
      {status}
    </span>
  );
}

function StatCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[10px] font-base text-foreground/50 uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-base font-heading text-foreground">{value}</div>
    </div>
  );
}

function BatchArchiveCard({ batch }: { batch: Batch }) {
  const receipts = getReceiptImages(batch);
  const photos = Array.isArray(batch.photos) ? batch.photos : [];
  const txHref =
    batch.txHash && batch.txHash !== "-"
      ? batch.txHash.startsWith("http")
        ? batch.txHash
        : `https://solscan.io/tx/${batch.txHash}`
      : "";
  const receiptCode = `RCP-${String(batch.id).padStart(3, "0")}`;

  return (
    <div className="border-2 border-border rounded-base bg-white p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-border">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-heading text-foreground truncate">{batch.name}</h2>
          <p className="text-xs font-base text-foreground/60 mt-0.5">
            {batch.startDate ? formatDate(batch.startDate) : "—"} → {batch.targetDate ? formatDate(batch.targetDate) : "—"}
          </p>
        </div>
        <StatusBadge status={batch.status} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 py-4">
        <StatCell icon={DollarSign} label="Rewards" value={batch.fees} />
        <StatCell icon={PawPrint} label="Cats" value={batch.cats} />
        <StatCell icon={Package} label="Food" value={batch.food} />
      </div>

      {/* On-chain */}
      {txHref && (
        <div className="flex items-center gap-2 py-3 border-t-2 border-border">
          <span className="text-[10px] font-base text-foreground/50 uppercase tracking-wider">On-chain</span>
          <a
            href={txHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-heading text-main underline hover:text-foreground transition-colors inline-flex items-center gap-1 min-w-0"
          >
            <span className="truncate">{formatTxHash(batch.txHash)}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      )}

      {/* Receipts */}
      {receipts.length > 0 && (
        <div className="py-3 border-t-2 border-border">
          <p className="text-[10px] font-base text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Receipt className="w-3 h-3" /> Receipts ({receipts.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {receipts.map((img, i) => (
              <a
                key={i}
                href={img}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-[3/4] bg-secondary-background border border-border rounded-base overflow-hidden hover:border-main transition-colors"
              >
                <img src={img} alt={`Receipt ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Feeding photos */}
      {photos.length > 0 && (
        <div className="py-3 border-t-2 border-border">
          <p className="text-[10px] font-base text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Camera className="w-3 h-3" /> Feeding photos ({photos.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.slice(0, 12).map((img, i) => (
              <a
                key={i}
                href={img}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square bg-secondary-background border border-border rounded-base overflow-hidden hover:border-main transition-colors"
              >
                <img src={img} alt={`Feeding photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
          {photos.length > 12 && (
            <p className="text-[10px] font-base text-foreground/40 mt-2">+ {photos.length - 12} more photos</p>
          )}
        </div>
      )}

      {/* Notes */}
      {batch.notes && (
        <div className="py-3 border-t-2 border-border">
          <p className="text-xs font-base text-foreground/70 leading-relaxed">{batch.notes}</p>
        </div>
      )}

      {/* Full receipt */}
      <div className="pt-3 border-t-2 border-border">
        <Link
          href={`/receipt/${receiptCode}`}
          target="_blank"
          className="text-xs font-heading text-main underline hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <Receipt className="w-3 h-3" /> View full receipt
        </Link>
      </div>
    </div>
  );
}

export default async function TransparencyPage() {
  const batches = getBatches();
  const stats = getStats();
  const settings = getSettings();
  const balanceSol = settings.foundationWallet ? await fetchSolBalance(settings.foundationWallet) : null;
  const sorted = [...batches].sort((a, b) => b.id - a.id);

  return (
    <main className="min-h-screen bg-background">
      <section className="relative w-full bg-gradient-to-b from-background to-secondary-background pt-28 pb-16 sm:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-heading text-foreground mb-3">Transparency</h1>
            <p className="text-base font-base text-foreground/60 max-w-2xl mx-auto">
              Every batch, documented end to end. Receipts, photos, and on-chain records for every feeding. You don&apos;t have to trust us. You only have to look.
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <div className="flex flex-col items-center text-center bg-secondary-background border border-border rounded-base p-3">
              <div className="text-[10px] font-base text-foreground/50 uppercase tracking-wider mb-1">Batches</div>
              <div className="text-xl font-heading text-foreground">{batches.length}</div>
            </div>
            <div className="flex flex-col items-center text-center bg-secondary-background border border-border rounded-base p-3">
              <div className="text-[10px] font-base text-foreground/50 uppercase tracking-wider mb-1">Rewards</div>
              <div className="text-xl font-heading text-foreground">{formatUsd(stats.totalFees)}</div>
            </div>
            <div className="flex flex-col items-center text-center bg-secondary-background border border-border rounded-base p-3">
              <div className="text-[10px] font-base text-foreground/50 uppercase tracking-wider mb-1">Cats fed</div>
              <div className="text-xl font-heading text-foreground">{stats.totalCats}</div>
            </div>
            <div className="flex flex-col items-center text-center bg-secondary-background border border-border rounded-base p-3">
              <div className="text-[10px] font-base text-foreground/50 uppercase tracking-wider mb-1">Food (kg)</div>
              <div className="text-xl font-heading text-foreground">{stats.totalFood}</div>
            </div>
          </div>

          {/* Foundation wallet */}
          {settings.foundationWallet && (
            <div className="mb-10 border-2 border-border rounded-base bg-secondary-background p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-heading text-foreground">Foundation Wallet</h2>
                  <p className="text-[10px] font-base text-foreground/50 mt-0.5">Public treasury. Rewards and donations land here, then become cat food. Never withdrawn as cash.</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-base text-foreground/50 uppercase tracking-wider">Balance</p>
                  <p className="text-xl font-heading text-foreground">{balanceSol !== null ? `${balanceSol.toFixed(4)} SOL` : "—"}</p>
                </div>
              </div>
              <div className="bg-background border border-border rounded-base p-3 flex items-center gap-2">
                <code className="flex-1 min-w-0 text-xs font-mono text-foreground truncate" title={settings.foundationWallet}>{settings.foundationWallet}</code>
                <a
                  href={`https://solscan.io/account/${settings.foundationWallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-heading text-main underline hover:text-foreground transition-colors inline-flex items-center gap-1 shrink-0"
                >
                  Solscan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Archive */}
          {sorted.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-base">
              <p className="text-sm font-base text-foreground/50">No batches documented yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sorted.map((batch) => (
                <BatchArchiveCard key={batch.id} batch={batch} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
