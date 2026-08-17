"use client";

import { formatTxHash } from "@/lib/utils";
import { Printer, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type InvoiceBatch = {
  id: number;
  name: string;
  status: string;
  startDate: string;
  targetDate: string;
  fees: string;
  cats: string;
  food: string;
  txHash: string;
  receiptImages: string[];
  receiptStore: string;
  receiptItem: string;
  receiptTotal: string;
  notes: string;
};

export type InvoiceSettings = {
  projectName: string;
};

export function getInvoiceCode(batch: Pick<InvoiceBatch, "id">): string {
  return `RCP-${String(batch.id).padStart(3, "0")}`;
}

function InvoiceRows({ batch }: { batch: InvoiceBatch }) {
  const totalSpent =
    batch.receiptTotal && batch.receiptTotal !== "$0"
      ? batch.receiptTotal
      : "-";

  return (
    <div className="border border-border overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr className="border-b border-border">
            <td className="py-2 px-3 font-base text-foreground/60 border-r border-border w-2/5">Item</td>
            <td className="py-2 px-3 text-right font-heading text-foreground">{batch.receiptItem || "~"}</td>
          </tr>
          <tr className="border-b border-border">
            <td className="py-2 px-3 font-base text-foreground/60 border-r border-border">Store</td>
            <td className="py-2 px-3 text-right font-heading text-foreground">{batch.receiptStore || "~"}</td>
          </tr>
          <tr className="border-b border-border">
            <td className="py-2 px-3 font-base text-foreground/60 border-r border-border">Food Bought</td>
            <td className="py-2 px-3 text-right font-heading text-foreground">{batch.status === "In Progress" || batch.status === "Feeding" ? "~" : batch.food}</td>
          </tr>
          <tr className="border-b border-border">
            <td className="py-2 px-3 font-base text-foreground/60 border-r border-border">
              <span className="inline-flex items-center gap-1.5">
                Funds Raised
                <InfoTooltip text="Funds collected specifically for this batch" />
              </span>
            </td>
            <td className="py-2 px-3 text-right font-heading text-foreground">{batch.status === "In Progress" || batch.status === "Feeding" ? "~" : `${batch.fees} USD`}</td>
          </tr>
          {batch.txHash && batch.txHash !== "-" && (
            <tr className="border-b border-border">
              <td className="py-2 px-3 font-base text-foreground/60 border-r border-border">Tx</td>
              <td className="py-2 px-3 text-right">
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
          <tr className="bg-zinc-100">
            <td className="py-2 px-3 font-heading text-foreground border-r border-border">Total</td>
            <td className="py-2 px-3 text-right font-heading text-foreground">{totalSpent !== "-" ? `${totalSpent} USD` : "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center w-4 h-4 text-foreground/40 hover:text-foreground transition-colors cursor-help">
            <Info className="w-2.5 h-2.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-base">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
    <div className="bg-white border border-border rounded-base shadow-shadow overflow-hidden">
      <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-border">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-heading text-foreground truncate">Receipt #{invoiceCode}</h3>
            <p className="text-xs font-base text-foreground/60 mt-0.5">Issued by {settings.projectName || "CATFUND"}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-base text-foreground/60">{batch.targetDate || "-"}</p>
            <p className="text-xs font-base text-foreground/60">{batch.status}</p>
            {batch.startDate && batch.targetDate && (
              <p className="text-xs font-base text-foreground/60">Period: {batch.startDate} - {batch.targetDate}</p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mt-5">
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

  return (
    <div className="bg-white border border-border rounded-base overflow-hidden">
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-border">
          <div className="min-w-0">
            <h3 className="text-base font-heading text-foreground truncate">Receipt #{invoiceCode}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-base text-foreground/60">{batch.targetDate || "-"}</p>
            <p className="text-[10px] font-base text-foreground/60">{batch.status}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-3">
          <InvoiceRows batch={batch} />
        </div>

        {/* Meta */}
        <div className="mt-3">
          <InvoiceMeta batch={batch} actionLink={actionLink} />
        </div>
      </div>
    </div>
  );
}
