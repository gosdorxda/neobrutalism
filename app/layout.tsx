import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NotificationBanner } from "@/components/notification-banner";
import { KalkulasiDrawer } from "@/components/kalkulasi";
import { ProjectNameProvider } from "@/components/project-name-provider";
import { SettingsProvider } from "@/components/settings-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = getSettings();
  const title = s.seoTitle || `${s.projectName} | Feeding Street Cats with Crypto`;
  const description = s.seoDescription || `Every swap fills a bowl for a street cat. ${s.projectName} turns creator rewards into meals, with receipts and photos for every batch.`;
  const keywords = s.seoKeywords ? s.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined;

  const openGraph = {
    title,
    description,
    type: "website" as const,
    ...(s.ogImage ? { images: [{ url: s.ogImage }] } : {}),
  };

  const twitter = {
    card: "summary_large_image" as const,
    title,
    description,
    ...(s.ogImage ? { images: [s.ogImage] } : {}),
  };

  return {
    title,
    description,
    keywords,
    openGraph,
    twitter,
    ...(s.favicon ? { icons: { icon: s.favicon, shortcut: s.favicon, apple: s.favicon } } : {}),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = getSettings();
  const { projectName, projectLogo } = settings;

  const histatsCode = settings.histatsCode?.trim() || "";
  let histatsScript = "";
  let histatsNoscript = "";
  if (histatsCode) {
    const scriptMatch = histatsCode.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
    if (scriptMatch) histatsScript = scriptMatch[1];
    const noscriptMatch = histatsCode.match(/<noscript[^>]*>([\s\S]*?)<\/noscript>/i);
    if (noscriptMatch) histatsNoscript = noscriptMatch[1];
  }

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} theme-${settings.theme} ${settings.font === "custom" ? "font-custom" : ""} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider initialTheme={settings.theme}>
          <ProjectNameProvider initialProjectName={projectName} initialProjectLogo={projectLogo}>
            <SettingsProvider initialSettings={settings}>
            <NotificationBanner text={settings.notificationText} />
            {children}
            <KalkulasiDrawer />
            </SettingsProvider>
          </ProjectNameProvider>
        </ThemeProvider>
        {histatsScript && (
          <script dangerouslySetInnerHTML={{ __html: histatsScript }} />
        )}
        {histatsNoscript && (
          <noscript dangerouslySetInnerHTML={{ __html: histatsNoscript }} />
        )}
      </body>
    </html>
  );
}
