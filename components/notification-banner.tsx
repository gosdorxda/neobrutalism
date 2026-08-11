"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "catfund-banner-dismissed";

export function NotificationBanner({ text }: { text: string }) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(localStorage.getItem(STORAGE_KEY) === text);
      setMounted(true);
    }
  }, [text]);

  if (!mounted || !text || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, text);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative overflow-hidden bg-main border-b-2 border-border"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <p className="text-sm font-heading text-main-foreground text-center flex-1">
            {text}
          </p>
          <button
            onClick={handleDismiss}
            className="shrink-0 w-6 h-6 rounded-full border-2 border-border bg-main-foreground/10 flex items-center justify-center hover:bg-main-foreground/20 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5 text-main-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}