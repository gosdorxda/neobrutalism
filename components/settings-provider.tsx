"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { type Settings } from "@/lib/settings";

type SettingsContextValue = {
  settings: Settings | null;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  loading: true,
});

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: ReactNode;
  initialSettings?: Settings | null;
}) {
  const [settings, setSettings] = useState<Settings | null>(initialSettings || null);
  const [loading, setLoading] = useState(!initialSettings);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (data) setSettings(data);
      } catch {
        // keep initial settings on error
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
