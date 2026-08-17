import { notFound } from "next/navigation";
import { getBatches } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { InvoiceView, getInvoiceCode, type InvoiceBatch, type InvoiceSettings } from "@/components/invoice";

export const dynamic = "force-dynamic";

function parseInvoiceCode(code: string): number | null {
  const match = code.match(/^RCP-(\d+)$/i);
  if (!match) return null;
  return Number(match[1]);
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const batchId = parseInvoiceCode(code);
  if (batchId === null) {
    notFound();
  }

  const batches = getBatches();
  const batch = batches.find((b) => b.id === batchId);
  if (!batch) {
    notFound();
  }

  const settings = getSettings();

  const invoiceBatch: InvoiceBatch = {
    id: batch.id,
    name: batch.name,
    status: batch.status,
    startDate: batch.startDate,
    targetDate: batch.targetDate,
    fees: batch.fees,
    cats: batch.cats,
    food: batch.food,
    txHash: batch.txHash,
    receiptImages: Array.isArray(batch.receiptImages) ? batch.receiptImages : [],
    receiptStore: batch.receiptStore,
    receiptItem: batch.receiptItem,
    receiptTotal: batch.receiptTotal,
    notes: batch.notes,
  };

  const invoiceSettings: InvoiceSettings = {
    projectName: settings.projectName,
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="w-full max-w-4xl">
        <InvoiceView batch={invoiceBatch} settings={invoiceSettings} showPrintButton />
      </div>
    </main>
  );
}
