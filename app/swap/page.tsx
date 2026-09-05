import { SwapCard } from "@/components/swap/SwapCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swap",
  description: "Swap SOL for the CatBowl token. A small fee feeds street cats.",
};

export default function SwapPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-base text-foreground/60 hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <SwapCard />
      </div>
    </main>
  );
}
