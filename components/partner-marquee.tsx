"use client";

import { Cat, Home, PawPrint, Shield, Heart, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Cat,
  Home,
  PawPrint,
  Shield,
  Heart,
};

type Partner = {
  name: string;
  description: string;
  logo: string;
  icon: string;
};

export function PartnerMarquee({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;

  // Duplicate the list several times for a wide, seamless track
  const items = Array(6).fill(partners).flat();

  return (
    <div className="relative w-full overflow-hidden">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-secondary-background to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-secondary-background to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee hover:pause">
        {items.map((partner, index) => {
          const Icon = iconMap[partner.icon] || Cat;

          return (
            <div
              key={`${partner.name}-${index}`}
              className="flex items-center gap-3 mx-4 sm:mx-6 w-[220px] sm:w-[260px] shrink-0"
            >
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-main/10 overflow-hidden flex items-center justify-center">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-main" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-heading text-foreground truncate">
                  {partner.name}
                </h4>
                <p className="text-[11px] font-base text-foreground/50 line-clamp-2 leading-relaxed">
                  {partner.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
