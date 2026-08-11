"use client";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/dashboard/skeleton";
import type { DashboardTx } from "@/components/dashboard/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRightLeft,
  Coins,
  Repeat,
  FileCode,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

const typeConfig = {
  "sol-transfer": { label: "SOL Transfer", icon: ArrowRightLeft, color: "bg-chart-2 text-white" },
  "token-transfer": { label: "Token Transfer", icon: Coins, color: "bg-chart-1 text-white" },
  swap: { label: "Swap", icon: Repeat, color: "bg-chart-3 text-black" },
  contract: { label: "Contract", icon: FileCode, color: "bg-chart-5 text-white" },
  unknown: { label: "Unknown", icon: HelpCircle, color: "bg-secondary-background text-foreground" },
};

const columns: ColumnDef<DashboardTx>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const config = typeConfig[type];
      const Icon = config.icon;
      return (
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-base border border-border flex items-center justify-center ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="font-base text-xs">{config.label}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return status === "success" ? (
        <Badge variant="neutral" className="bg-green-500 text-white border-transparent text-[10px]">
          Success
        </Badge>
      ) : (
        <Badge variant="neutral" className="bg-red-500 text-white border-transparent text-[10px]">
          Failed
        </Badge>
      );
    },
  },
  {
    accessorKey: "from",
    header: "From",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.from || "—"}</span>
    ),
  },
  {
    accessorKey: "to",
    header: "To",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.to || "—"}</span>
    ),
  },
  {
    accessorKey: "readable",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-heading text-xs">{row.original.readable}</span>
    ),
  },
  {
    accessorKey: "feeSol",
    header: "Fee",
    cell: ({ row }) => (
      <span className="font-base text-xs text-foreground/60">
        {row.original.feeSol != null ? `${row.original.feeSol.toFixed(6)} SOL` : "—"}
      </span>
    ),
  },
  {
    accessorKey: "timeAgo",
    header: "Time",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-base text-xs">{row.original.timeAgo}</span>
        <span className="font-base text-[10px] text-foreground/50">{row.original.formattedDate}</span>
      </div>
    ),
  },
  {
    id: "action",
    header: "",
    meta: { className: "w-12" },
    cell: ({ row }) => (
      <a
        href={row.original.solscanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-8 h-8 rounded-base border-2 border-border bg-secondary-background hover:bg-main hover:text-main-foreground transition-colors"
        aria-label="View on Solscan"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    ),
  },
];

function SkeletonTable() {
  return (
    <div className="bg-white overflow-hidden border-2 border-border rounded-base">
      <div className="grid grid-cols-8 gap-2 p-3 bg-foreground/5 border-b-2 border-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-8 gap-2 p-3 border-b border-border last:border-0">
          {Array.from({ length: 8 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TransactionTable({
  transactions,
  loading,
}: {
  transactions: DashboardTx[];
  loading: boolean;
}) {
  if (loading) return <SkeletonTable />;
  if (transactions.length === 0) {
    return (
      <div className="bg-secondary-background border-2 border-border rounded-base p-8 text-center">
        <p className="text-sm font-base text-foreground/60">No transactions found.</p>
      </div>
    );
  }
  return (
    <div className="border-2 border-border rounded-base overflow-hidden">
      <DataTable columns={columns} data={transactions} />
    </div>
  );
}
