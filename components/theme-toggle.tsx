"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { themes, useTheme } from "@/components/theme-provider";
import { Palette } from "lucide-react";

function ThemeSwatch({ bg, main }: { bg: string; main: string }) {
  return (
    <span
      className="inline-block h-5 w-5 rounded-base border-2 border-border shadow-shadow shrink-0"
      style={{ background: `linear-gradient(135deg, ${bg} 50%, ${main} 50%)` }}
      aria-hidden="true"
    />
  );
}

export function ThemeToggle({
  variant = "icon",
}: {
  variant?: "icon" | "full";
}) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "icon" ? "neutral" : "default"}
          size={variant === "icon" ? "icon" : "default"}
          className={variant === "full" ? "gap-2" : "h-8 w-8"}
          aria-label="Change color theme"
        >
          <Palette className="h-4 w-4" />
          {variant === "full" && <span>Theme</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-heading">
          Pick a vibe
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as typeof theme)}>
          {themes.map(({ id, label, bg, main }) => (
            <DropdownMenuRadioItem
              key={id}
              value={id}
              className="flex items-center gap-3 cursor-pointer data-[state=checked]:border-border"
            >
              <ThemeSwatch bg={bg} main={main} />
              <span className="flex-1">{label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
