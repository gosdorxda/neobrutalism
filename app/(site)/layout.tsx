import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MaintenanceScreen } from "@/components/maintenance-screen";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();

  if (settings.maintenanceMode) {
    return (
      <MaintenanceScreen
        message={settings.maintenanceMessage}
      />
    );
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
