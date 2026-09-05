import type { Metadata } from "next";
import { LiveStreamV3 } from "@/components/live/live-stream-v3";

export const metadata: Metadata = {
  title: "Live",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function LivePage() {
  return <LiveStreamV3 />;
}
