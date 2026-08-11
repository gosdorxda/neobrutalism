import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { NotificationBanner } from "@/components/notification-banner";
import { ProjectNameProvider } from "@/components/project-name-provider";
import { SettingsProvider } from "@/components/settings-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { getSettings } from "@/lib/settings";
import { getSolPrice } from "@/lib/cache";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { projectName } = getSettings();
  return {
    title: `${projectName} - Revolutionary Meme Coin`,
    description: `Join the future of decentralized finance with ${projectName} - bold design meets community power`,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = getSettings();
  const { projectName } = settings;
  const initialSolPrice = await getSolPrice();

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} theme-${settings.theme} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider initialTheme={settings.theme}>
          <ProjectNameProvider initialProjectName={projectName}>
            <SettingsProvider initialSettings={settings}>
              <NotificationBanner text={settings.notificationText} />
              <Navbar initialSolPrice={initialSolPrice} />
              {children}
              <Footer />
            </SettingsProvider>
          </ProjectNameProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
