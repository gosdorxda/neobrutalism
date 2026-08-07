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
