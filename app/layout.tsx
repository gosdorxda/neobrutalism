import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NotificationBanner } from "@/components/notification-banner";
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
  const title = s.seoTitle || `${s.projectName} - Revolutionary Meme Coin`;
  const description = s.seoDescription || `Join the future of decentralized finance with ${s.projectName} - bold design meets community power`;
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
            </SettingsProvider>
          </ProjectNameProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
