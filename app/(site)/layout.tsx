import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
