import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getSolPrice } from "@/lib/cache";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const initialSolPrice = await getSolPrice();
  return (
    <>
      <Navbar initialSolPrice={initialSolPrice} />
      {children}
      <Footer />
    </>
  );
}
