"use client";

import { useCountUpNumber } from "@/hooks/use-count-up";
import { formatUsd } from "@/lib/utils";

export function RewardsCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const animated = useCountUpNumber(value, duration);
  return (
    <p className="rewards-shine text-4xl sm:text-5xl font-heading">
      {formatUsd(animated)}
    </p>
  );
}
