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
  heroBackground: string;
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
  histatsCode: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  showImpactSection: boolean;
  fundActivityEnabled: boolean;
  fundActivityMinUsd: number;
  fundActivityPollSeconds: number;
  tplDonation: string;
  tplRewards: string;
  tplPurchase: string;
  tplBatch: string;
  tplFeedingProof: string;
  swapFeeBps: number;
};

const defaultSettings: Settings = {
  tokenCa: "CATFUNDeio111111111111111111111111111111111",
  projectName: "CATFUND",
  projectLogo: "",
  heroBackground: "",
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
  histatsCode: "",
  maintenanceMode: false,
  maintenanceMessage: "",
  showImpactSection: true,
  fundActivityEnabled: false,
  fundActivityMinUsd: 1,
  fundActivityPollSeconds: 60,
  tplDonation:
    "💰 FUND ACTIVITY\n\nDonation Received\nDate: {date}\nAmount: +{amount} {token}{usd}\nTx: {tx}\nSender: {sender}",
  tplRewards:
    "💰 FUND ACTIVITY\n\nCreator Rewards Received\nDate: {date}\nAmount: +{amount}{usd}\nTx: {tx}\nBatch: {batch}",
  tplPurchase:
    "🛒 FUND ACTIVITY\n\nFood Purchase\nDate: {date}\nAmount: −{amount}\nStore: {store}\nItem: {item}\nReceipt: {receipt}\nTx: {tx}\nBatch: {batch}",
  tplBatch:
    "📦 CURRENT BATCH\n\n{name} (#{id})\nStatus: {status}\nPeriod: {period}\nEst. Rewards: {rewards}\nEst. Bowls: {bowls}",
  tplFeedingProof:
    "📸 FEEDING PROOF — {name}\n\n🏪 Store: {store}\n📦 Item: {item}\n💰 Total: {total}\n🗓️ Date: {date}\n\n🐱 Cats: {cats}\n📦 Food: {food}\n💰 Rewards: {fees}\n\n🔗 Tx: {tx}\n🧾 Receipt: {receiptUrl}\n\n100% rewards → food. No cash. 🐾",
  swapFeeBps: 100,
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
