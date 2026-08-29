import { getStats } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { PartnerMarquee } from "@/components/partner-marquee";
import { RewardsCounter } from "@/components/rewards-counter";
import { ChevronDown } from "lucide-react";

export function StatsBar() {
  const stats = getStats();
  const settings = getSettings();
  const partners = settings.partners || [];
  const heroBackground = settings.heroBackground?.trim() || "";
  const onPhoto = Boolean(heroBackground);

  return (
    <section className="relative w-full bg-gradient-to-b from-background to-secondary-background border-y-2 border-border py-8 mt-14">
      {heroBackground && (
        <div className="absolute inset-0 z-0">
          <img
            src={heroBackground}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
      )}
      {!heroBackground && (
        <img
          src="/cat-sleeping-a.svg"
          alt=""
          className="absolute -top-40 sm:-top-48 left-1/2 -translate-x-1/2 w-64 h-64 sm:w-80 sm:h-80 rotate-3 pointer-events-none select-none"
        />
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-2">
          <h2 className={`text-3xl font-heading mb-3 ${onPhoto ? "text-white" : "text-foreground"}`}>
            Our Impact So Far
          </h2>
          <p className={`text-sm font-base ${onPhoto ? "text-white/80" : "text-foreground/60"}`}>
            Every swap fills a bowl for a street cat. Every number is backed by receipts and photos.
          </p>
        </div>

        {/* connector: subtitle → value */}
        <div className="flex flex-col items-center mb-1">
          <div className={`w-px h-2 ${onPhoto ? "bg-white/25" : "bg-foreground/20"}`} />
          <ChevronDown className={`w-2.5 h-2.5 -mt-0.5 ${onPhoto ? "text-white/40" : "text-foreground/30"}`} />
        </div>

        {/* Rewards Collected - all-time headline */}
        <div className="text-center mb-8">
          <RewardsCounter value={stats.totalFees} />
          <p className={`text-sm font-base mt-1 ${onPhoto ? "text-white/60" : "text-foreground/50"}`}>All-time creator rewards collected.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Cats Fed */}
          <div className="flex flex-col items-center text-center bg-secondary-background border-2 border-border rounded-base p-4">
            <div className="text-xs font-heading text-foreground/50 uppercase tracking-wider mb-2">
              Total Cats Fed
            </div>
            <div className="text-2xl sm:text-3xl font-heading text-foreground">
              {stats.totalCats}
            </div>
          </div>

          {/* Food Bought */}
          <div className="flex flex-col items-center text-center bg-secondary-background border-2 border-border rounded-base p-4">
            <div className="text-xs font-heading text-foreground/50 uppercase tracking-wider mb-2">
              Food Bought
            </div>
            <div className="text-2xl sm:text-3xl font-heading text-foreground">
              {stats.totalFood} kg
            </div>
          </div>

          {/* Partners Helped */}
          <div className="flex flex-col items-center text-center bg-secondary-background border-2 border-border rounded-base p-4">
            <div className="text-xs font-heading text-foreground/50 uppercase tracking-wider mb-2">
              Partners Helped
            </div>
            <div className="text-2xl sm:text-3xl font-heading text-foreground">
              {partners.length}
            </div>
          </div>

          {/* Feeding Rounds */}
          <div className="flex flex-col items-center text-center bg-secondary-background border-2 border-border rounded-base p-4">
            <div className="text-xs font-heading text-foreground/50 uppercase tracking-wider mb-2">
              Feeding Rounds
            </div>
            <div className="text-2xl sm:text-3xl font-heading text-foreground">
              {stats.feedingRounds}
            </div>
          </div>
        </div>

        {/* Partner Marquee */}
        {partners.length > 0 && (
          <div className="mt-10 sm:mt-12">
            <PartnerMarquee partners={partners} />
          </div>
        )}
      </div>
    </section>
  );
}
