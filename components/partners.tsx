"use client";

import { Button } from "@/components/ui/button";
import { useSettings } from "@/components/settings-provider";
import { Cat, Heart, Home, PawPrint, Shield, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Cat,
  Home,
  PawPrint,
  Shield,
  Heart,
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.512c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.126-5.864 10.126-11.854z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const socialLinks = [
  {
    key: "instagram" as const,
    label: "Instagram",
    Icon: InstagramIcon,
    buttonClass:
      "h-6 w-6 border-[1px] border-black bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white hover:opacity-90",
  },
  {
    key: "facebook" as const,
    label: "Facebook",
    Icon: FacebookIcon,
    buttonClass:
      "h-6 w-6 border-[1px] border-black bg-[#1877F2] text-white hover:bg-[#166fe5]",
  },
  {
    key: "tiktok" as const,
    label: "TikTok",
    Icon: TikTokIcon,
    buttonClass:
      "h-6 w-6 border-[1px] border-black bg-black text-white hover:bg-gray-800",
  },
];

export function Partners() {
  const { settings } = useSettings();
  const partners = settings?.partners || [];
  const applyLink = settings?.partnerApplyLink?.trim();

  return (
    <section id="partners" className="w-full bg-gradient-to-b from-background to-secondary-background border-y-2 border-border py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading text-foreground mb-3">
            Rescue Partners
          </h2>
          <p className="text-sm font-base text-foreground/60 max-w-lg mx-auto">
            Working alongside local cat rescues and shelters to turn every swap into a meal for street cats.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {partners.length === 0 && (
            <p className="w-full text-center text-sm font-base text-foreground/50">
              No rescue partners added yet.
            </p>
          )}

          {partners.map((partner) => {
            const Icon = iconMap[partner.icon] || Cat;
            return (
              <div
                key={partner.name}
                className="w-40 flex flex-col items-center text-center gap-3 bg-secondary-background border-2 border-border rounded-base p-4 shadow-shadow"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-main/10 border-2 border-border flex items-center justify-center overflow-hidden">
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-10 h-10 text-main" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-heading text-foreground leading-tight">
                      {partner.name}
                    </h3>
                    <p className="text-[10px] font-base text-foreground/50 mt-1 line-clamp-2">
                      {partner.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {socialLinks.map(({ key, label, Icon, buttonClass }) => {
                    const url = partner.socials[key]?.trim();
                    if (!url) return null;
                    return (
                      <Button
                        key={key}
                        variant="noShadow"
                        size="icon"
                        className={buttonClass}
                        asChild
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${partner.name} ${label}`}
                        >
                          <Icon className="w-3 h-3" />
                        </a>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {applyLink && (
          <div className="mt-8 text-center">
            <p className="text-sm font-base text-foreground/70">
              Want to become a rescue partner?{" "}
              <a
                href={applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-main underline hover:text-foreground transition-colors"
              >
                Apply here
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
