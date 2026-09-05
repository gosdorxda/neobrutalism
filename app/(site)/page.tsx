import { Hero } from "@/components/hero";
import { StatsBar } from "@/components/stats-bar";
import { TokenInfo } from "@/components/token-info";
import { BatchHistory } from "@/components/batch-history";
import { Gallery } from "@/components/gallery";
import { HowItWorks } from "@/components/how-it-works";
import { ImpactSection } from "@/components/impact/ImpactSection";
import { FAQ } from "@/components/faq";
import { Partners } from "@/components/partners";
import { AreaCover } from "@/components/area-cover";
import { getAllPhotos } from "@/lib/data";
import { getStats, getTokenInfo } from "@/lib/cache";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const photos = getAllPhotos();
  const [stats, token] = await Promise.all([getStats(), getTokenInfo()]);
  const settings = getSettings();

  return (
    <div className="min-h-screen bg-background">
      <Hero initialStats={stats} />
      <StatsBar />
      <BatchHistory />
      <Gallery photos={photos} />
      <HowItWorks />
      {settings.showImpactSection !== false && <ImpactSection />}
      <Partners />
      <TokenInfo initialToken={token} />
      <AreaCover />
      <FAQ />
    </div>
  );
}
