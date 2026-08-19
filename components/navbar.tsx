"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProjectName } from "@/components/project-name-provider";
import { useSettings } from "@/components/settings-provider";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Impact History", href: "#batches" },
  { label: "Gallery", href: "#gallery" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Token", href: "#token" },
  { label: "Partners", href: "#helped" },
  { label: "FAQ", href: "#faq" },
];

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

export function Navbar() {
  const { projectName, projectLogo } = useProjectName();
  const { settings } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const closeMenu = () => setIsMenuOpen(false);

  const telegram = settings?.telegram?.trim();
  const twitter = settings?.twitter?.trim();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full bg-[linear-gradient(to_bottom,var(--background)_0%,transparent_100%)] backdrop-blur-md transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {projectLogo && (
              <img
                src={projectLogo}
                alt={projectName}
                className="h-8 sm:h-9 w-auto object-contain"
              />
            )}
            <span className="text-xl font-heading text-foreground/85 leading-none">
              {projectName}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="relative text-sm font-base text-foreground transition-colors py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-main transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop Social Icons */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {telegram && (
              <Button
                variant="noShadow"
                size="icon"
                className="h-7 w-7 border-[1px] border-black bg-[#0088CC] text-white hover:bg-[#0077b3]"
                asChild
              >
                <a href={telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  {telegramIcon}
                </a>
              </Button>
            )}
            {twitter && (
              <Button
                variant="noShadow"
                size="icon"
                className="h-7 w-7 border-[1px] border-black bg-black text-white hover:bg-gray-800"
                asChild
              >
                <a href={twitter} target="_blank" rel="noopener noreferrer" aria-label="X">
                  {xIcon}
                </a>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="relative h-9 w-9 md:hidden flex items-center justify-center text-foreground hover:text-foreground/70 transition-colors focus:outline-none"
          >
            <Menu
              className={cn(
                "h-5 w-5 absolute transition-all duration-300 ease-in-out",
                isMenuOpen
                  ? "opacity-0 rotate-90 scale-50"
                  : "opacity-100 rotate-0 scale-100"
              )}
              aria-hidden={isMenuOpen}
            />
            <X
              className={cn(
                "h-5 w-5 absolute transition-all duration-300 ease-in-out",
                isMenuOpen
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-50"
              )}
              aria-hidden={!isMenuOpen}
            />
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[linear-gradient(to_bottom,var(--background)_0%,var(--background)_80%,transparent_100%)] backdrop-blur-lg md:hidden transition-all duration-300 flex flex-col items-center justify-center px-6",
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col items-center gap-6 text-center">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="text-2xl font-heading text-foreground hover:text-main transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 mt-2">
            {telegram && (
              <Button
                variant="noShadow"
                size="icon"
                className="h-8 w-8 border-[1px] border-black bg-[#0088CC] text-white hover:bg-[#0077b3]"
                asChild
              >
                <a href={telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  {telegramIcon}
                </a>
              </Button>
            )}
            {twitter && (
              <Button
                variant="noShadow"
                size="icon"
                className="h-8 w-8 border-[1px] border-black bg-black text-white hover:bg-gray-800"
                asChild
              >
                <a href={twitter} target="_blank" rel="noopener noreferrer" aria-label="X">
                  {xIcon}
                </a>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}