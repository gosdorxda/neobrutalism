import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProjectNameProvider } from "@/components/project-name-provider";
import { SettingsProvider } from "@/components/settings-provider";
import { getSettings } from "@/lib/settings";
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

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ProjectNameProvider initialProjectName={projectName}>
          <SettingsProvider initialSettings={settings}>
            <Navbar />
            {children}
            <Footer />
          </SettingsProvider>
        </ProjectNameProvider>
      </body>
    </html>
  );
}
