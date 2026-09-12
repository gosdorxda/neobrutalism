import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getThumbPath(fullPath: string): string {
  if (!fullPath) return "";
  const parts = fullPath.split("/");
  const fileName = parts[parts.length - 1];
  parts[parts.length - 1] = `thumb-${fileName}`;
  return parts.join("/");
}

export function formatTxHash(txHash: string): string {
  if (!txHash || txHash === "-") return "-";
  if (txHash.length <= 12) return txHash;
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
}

export function formatUsd(value: number): string {
  const absValue = Math.abs(value);
  let fractionDigits = 2;
  if (absValue > 0 && absValue < 0.01) {
    fractionDigits = 6;
  } else if (absValue > 0 && absValue < 1) {
    fractionDigits = 4;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function parseFeeNumber(fees: string): number {
  return Number(fees.replace(/[^0-9.]/g, "")) || 0;
}

export function isUsdFees(fees: string): boolean {
  return fees.trim().startsWith("$");
}

export function formatFeesDisplay(fees: string, solPrice: number): { primary: string; secondary: string } {
  const num = parseFeeNumber(fees);
  if (isUsdFees(fees)) {
    const sol = solPrice > 0 ? num / solPrice : 0;
    return {
      primary: sol > 0 ? `${sol.toFixed(4)} SOL` : `${num.toFixed(2)} USD`,
      secondary: "",
    };
  }
  return {
    primary: `${num} SOL`,
    secondary: "",
  };
}
