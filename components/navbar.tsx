"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useProjectName } from "@/components/project-name-provider";
import { useSettings } from "@/components/settings-provider";

export function Navbar() {
  const { projectName } = useProjectName();
  const { settings } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  const telegram = settings?.telegram?.trim();
  const twitter = settings?.twitter?.trim();

  return (
    <div className="w-full bg-background pt-4 px-4 sm:px-6 lg:px-8">
      <nav className="mx-auto max-w-6xl border-2 border-border bg-white rounded-base">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-heading text-foreground">
                  {projectName}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex md:items-center md:gap-4">
              <a href="#batches" className="font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                Batch History
              </a>
              <a href="#gallery" className="font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                Gallery
              </a>
              <a href="#token" className="font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                Token
              </a>
              <a href="#about" className="font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                About
              </a>
              <a href="#faq" className="font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                FAQ
              </a>
              <a href="#partners" className="font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                Partners
              </a>
            </div>

            {/* Desktop Social Buttons */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {telegram && (
                <Button variant="noShadow" size="icon" className="h-8 w-8 border-[1px] border-black bg-[#0088CC] text-white hover:bg-[#0077b3] hover:border-black" asChild>
                  <a href={telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </a>
                </Button>
              )}
              {twitter && (
                <Button variant="noShadow" size="icon" className="h-8 w-8 border-[1px] border-black bg-black text-white hover:bg-gray-800 hover:border-gray-800" asChild>
                  <a href={twitter} target="_blank" rel="noopener noreferrer" aria-label="X">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="neutral"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="border-t-2 border-border md:hidden">
            <div className="space-y-1 px-4 pb-3 pt-2">
              <a href="#batches" onClick={closeMenu} className="block py-2 font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                Batch History
              </a>
              <a href="#gallery" onClick={closeMenu} className="block py-2 font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                Gallery
              </a>
              <a href="#token" onClick={closeMenu} className="block py-2 font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                Token
              </a>
              <a href="#about" onClick={closeMenu} className="block py-2 font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                About
              </a>
              <a href="#faq" onClick={closeMenu} className="block py-2 font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                FAQ
              </a>
              <a href="#partners" onClick={closeMenu} className="block py-2 font-base text-sm text-foreground hover:text-foreground/70 transition-colors">
                Partners
              </a>
              <div className="flex gap-2 mt-2">
                {telegram && (
                  <Button variant="noShadow" size="icon" className="flex-1 h-8 border-[1px] border-black bg-[#0088CC] text-white hover:bg-[#0077b3] hover:border-black" asChild>
                    <a href={telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mx-auto">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </a>
                  </Button>
                )}
                {twitter && (
                  <Button variant="noShadow" size="icon" className="flex-1 h-8 border-[1px] border-black bg-black text-white hover:bg-gray-800 hover:border-gray-800" asChild>
                    <a href={twitter} target="_blank" rel="noopener noreferrer" aria-label="X">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mx-auto">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
