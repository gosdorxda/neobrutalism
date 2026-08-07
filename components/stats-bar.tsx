import { getStats } from "@/lib/data";
import { formatUsd } from "@/lib/utils";

export function StatsBar() {
  const stats = getStats();

  return (
    <section className="relative w-full bg-gradient-to-b from-background to-secondary-background border-y-2 border-border py-8 mt-14">
      {/* Sleeping cat resting on the top border */}
      <img
        src="/cat-sleeping-a.svg"
        alt=""
        className="absolute -top-40 sm:-top-48 left-1/2 -translate-x-1/2 w-64 h-64 sm:w-80 sm:h-80 rotate-3 pointer-events-none select-none"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-heading text-foreground mb-3">
            Our Impact So Far
          </h2>
          <p className="text-sm font-base text-foreground/60">
            Creator rewards turned into real meals for street cats. Every number is backed by receipts and photos.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Creator Rewards */}
          <div className="flex flex-col items-center text-center bg-secondary-background border-2 border-border rounded-base p-4">
            <div className="text-xs font-heading text-foreground/50 uppercase tracking-wider mb-2">
              Creator Rewards
            </div>
            <div className="text-2xl sm:text-3xl font-heading text-foreground">
              {formatUsd(stats.totalFees)}
            </div>
          </div>

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
              {stats.totalFood}kg
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
      </div>
    </section>
  );
}
