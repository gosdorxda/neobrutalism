import { computeImpact, type ImpactData } from "@/lib/helius";
import { getSettings } from "@/lib/settings";
import { ImpactCard } from "@/components/impact/ImpactCard";
import { ImpactDialog } from "@/components/impact/ImpactDialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ wallet: string }>;
}): Promise<Metadata> {
  const { wallet } = await params;
  const short = `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  return {
    title: "Your Impact",
    description: `See how many street cats wallet ${short} has helped feed.`,
  };
}

export default async function ImpactPage({
  params,
}: {
  params: Promise<{ wallet: string }>;
}) {
  const { wallet } = await params;
  const settings = getSettings();
  const tokenMint = settings.tokenCa?.trim();

  let data: ImpactData | null = null;
  let errorMsg: string | null = null;

  if (tokenMint && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    try {
      data = await computeImpact(wallet, tokenMint);
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : "Failed to compute impact.";
    }
  }

  return (
    <main className="min-h-screen bg-background pt-28 pb-16 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        {data ? (
          <div className="space-y-6 text-center">
            <ImpactCard data={data} projectName={settings.projectName} />
            <div>
              <ImpactDialog
                trigger={
                  <Button variant="default" size="default">
                    Check your own impact
                  </Button>
                }
              />
            </div>
            <Link
              href="/"
              className="inline-block text-sm font-base text-foreground/60 hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm font-base text-foreground/60">
              {errorMsg || "No impact data found for this wallet."}
            </p>
            <Link
              href="/"
              className="inline-block text-sm font-base text-foreground/60 hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
