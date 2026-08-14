import fs from "fs";
import path from "path";

const settingsFilePath = path.join(process.cwd(), "data", "settings.json");

export type Partner = {
  name: string;
  description: string;
  href: string;
  icon: "Cat" | "Home" | "PawPrint" | "Shield" | "Heart";
  logo: string;
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
};

export type Theme = "original" | "mint" | "lavender" | "lemon";

export type Font = "default" | "custom";

export type Settings = {
  tokenCa: string;
  projectName: string;
  projectLogo: string;
  creatorWallet: string;
  foundationWallet: string;
  telegram: string;
  twitter: string;
  instagram: string;
  tiktok: string;
  partnerApplyLink: string;
  partners: Partner[];
  theme: Theme;
  font: Font;
  notificationText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  favicon: string;
};

const defaultSettings: Settings = {
  tokenCa: "CATFUNDeio111111111111111111111111111111111",
  projectName: "CATFUND",
  projectLogo: "",
  creatorWallet: "",
  foundationWallet: "",
  telegram: "",
  twitter: "",
  instagram: "",
  tiktok: "",
  partnerApplyLink: "",
  partners: [],
  theme: "original",
  font: "default",
  notificationText: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ogImage: "",
  favicon: "",
};

export function getSettings(): Settings {
  try {
    const data = fs.readFileSync(settingsFilePath, "utf8");
    return { ...defaultSettings, ...JSON.parse(data) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Partial<Settings>): Settings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  fs.writeFileSync(settingsFilePath, JSON.stringify(updated, null, 2), "utf8");
  return updated;
}
