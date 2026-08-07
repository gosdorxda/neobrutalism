import { Hero } from "@/components/hero";
import { StatsBar } from "@/components/stats-bar";
import { TokenInfo } from "@/components/token-info";
import { TopDonors } from "@/components/top-donors";
import { BatchHistory } from "@/components/batch-history";
import { Gallery } from "@/components/gallery";
import { HowItWorks } from "@/components/how-it-works";
import { FAQ } from "@/components/faq";
import { Partners } from "@/components/partners";
import { getAllPhotos } from "@/lib/data";

export default function Home() {
  const photos = getAllPhotos();

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <StatsBar />
      <BatchHistory />
      <Gallery photos={photos} />
      <HowItWorks />
      <TokenInfo />
      <TopDonors />
      <FAQ />
      <Partners />
    </div>
  );
}
