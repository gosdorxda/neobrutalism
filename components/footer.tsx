"use client";

import { Button } from "@/components/ui/button";
import { useProjectName } from "@/components/project-name-provider";
import { useSettings } from "@/components/settings-provider";
import { useEffect, useMemo, useState } from "react";

const telegramIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const xIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const instagramIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const tiktokIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const navLinks = [
  { label: "Batch History", href: "#batches" },
  { label: "Gallery", href: "#gallery" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Footer() {
  const { projectName, tokenSymbol } = useProjectName();
  const { settings } = useSettings();
  const [buyUrl, setBuyUrl] = useState("https://pump.fun");

  const socialLinks = useMemo(() => {
    const links = [];
    if (settings?.telegram?.trim()) {
      links.push({
        label: "Telegram",
        href: settings.telegram.trim(),
        buttonClass:
          "h-7 w-7 border-[1px] border-black bg-[#0088CC] text-white hover:bg-[#0077b3]",
        icon: telegramIcon,
      });
    }
    if (settings?.twitter?.trim()) {
      links.push({
        label: "X",
        href: settings.twitter.trim(),
        buttonClass:
          "h-7 w-7 border-[1px] border-black bg-black text-white hover:bg-gray-800",
        icon: xIcon,
      });
    }
    if (settings?.instagram?.trim()) {
      links.push({
        label: "Instagram",
        href: settings.instagram.trim(),
        buttonClass:
          "h-7 w-7 border-[1px] border-black bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white hover:opacity-90",
        icon: instagramIcon,
      });
    }
    if (settings?.tiktok?.trim()) {
      links.push({
        label: "TikTok",
        href: settings.tiktok.trim(),
        buttonClass:
          "h-7 w-7 border-[1px] border-black bg-black text-white hover:bg-gray-800",
        icon: tiktokIcon,
      });
    }
    return links;
  }, [settings]);

  useEffect(() => {
    async function loadToken() {
      try {
        const res = await fetch("/api/token", { cache: "no-store" });
        const data = await res.json();
        setBuyUrl(data.buyUrl || "https://pump.fun");
      } catch {
        setBuyUrl("https://pump.fun");
      }
    }
    loadToken();
  }, []);

  return (
    <footer className="border-t-2 border-border bg-secondary-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center text-center gap-5">
          {/* Brand */}
          <div className="space-y-1">
            <h3 className="text-lg font-heading text-foreground">{projectName}</h3>
            <p className="text-xs font-base text-foreground/60">
              Every swap fills a bowl for a street cat.
            </p>
          </div>

          {/* Non-profit Notice */}
          <div className="max-w-xl rounded-base bg-zinc-100 px-4 py-3">
            <p className="text-xs font-base text-foreground/70 leading-relaxed">
              Run by volunteers who love cats. No team allocation. No hidden fees. Every trade helps put real food in bowls for street cats.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-base text-foreground/70 hover:text-foreground transition-colors"
            >
              Buy {tokenSymbol}
            </a>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-base text-foreground/70 hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <Button
                key={social.label}
                variant="noShadow"
                size="icon"
                className={social.buttonClass}
                asChild
              >
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              </Button>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs font-heading text-foreground/50">
            © 2026 {projectName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
