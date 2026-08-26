import { getSettings, saveSettings, type Settings, type Partner } from "@/lib/settings";
import { NextRequest, NextResponse } from "next/server";

const validThemes = ["original", "mint", "lavender", "lemon"] as const;
const validFonts = ["default", "custom"] as const;

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === `Bearer ${adminPassword}`;
}

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Partial<Settings> = {};

    if (body.tokenCa !== undefined) {
      if (typeof body.tokenCa !== "string" || !body.tokenCa.trim()) {
        return NextResponse.json({ error: "Invalid contract address" }, { status: 400 });
      }
      updates.tokenCa = body.tokenCa.trim();
    }

    if (body.projectName !== undefined) {
      if (typeof body.projectName !== "string" || !body.projectName.trim()) {
        return NextResponse.json({ error: "Invalid project name" }, { status: 400 });
      }
      updates.projectName = body.projectName.trim();
    }

    if (body.projectLogo !== undefined) {
      if (typeof body.projectLogo !== "string") {
        return NextResponse.json({ error: "Invalid project logo" }, { status: 400 });
      }
      updates.projectLogo = body.projectLogo.trim();
    }

    if (body.creatorWallet !== undefined) {
      if (typeof body.creatorWallet !== "string") {
        return NextResponse.json({ error: "Invalid creator wallet" }, { status: 400 });
      }
      updates.creatorWallet = body.creatorWallet.trim();
    }

    if (body.foundationWallet !== undefined) {
      if (typeof body.foundationWallet !== "string") {
        return NextResponse.json({ error: "Invalid foundation wallet" }, { status: 400 });
      }
      updates.foundationWallet = body.foundationWallet.trim();
    }

    const socialFields = ["telegram", "twitter", "instagram", "tiktok", "partnerApplyLink"] as const;
    socialFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return;
        }
        (updates as Record<string, string>)[field] = body[field].trim();
      }
    });

    if (body.theme !== undefined) {
      if (!validThemes.includes(body.theme)) {
        return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
      }
      updates.theme = body.theme;
    }

    if (body.font !== undefined) {
      if (!validFonts.includes(body.font)) {
        return NextResponse.json({ error: "Invalid font" }, { status: 400 });
      }
      updates.font = body.font;
    }

    if (body.notificationText !== undefined) {
      if (typeof body.notificationText !== "string") {
        return NextResponse.json({ error: "Invalid notification text" }, { status: 400 });
      }
      updates.notificationText = body.notificationText.trim();
    }

    const seoFields = ["seoTitle", "seoDescription", "seoKeywords", "ogImage", "favicon"] as const;
    seoFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return;
        }
        (updates as Record<string, string>)[field] = body[field].trim();
      }
    });

    if (body.maintenanceMode !== undefined) {
      updates.maintenanceMode = Boolean(body.maintenanceMode);
    }

    if (body.maintenanceMessage !== undefined) {
      if (typeof body.maintenanceMessage !== "string") {
        return NextResponse.json({ error: "Invalid maintenance message" }, { status: 400 });
      }
      updates.maintenanceMessage = body.maintenanceMessage.trim();
    }

    if (body.fundActivityEnabled !== undefined) {
      updates.fundActivityEnabled = Boolean(body.fundActivityEnabled);
    }

    if (body.fundActivityMinUsd !== undefined) {
      const v = Number(body.fundActivityMinUsd);
      if (!isNaN(v) && v >= 0) {
        updates.fundActivityMinUsd = v;
      }
    }

    if (body.fundActivityPollSeconds !== undefined) {
      const v = Number(body.fundActivityPollSeconds);
      if (!isNaN(v) && v >= 15) {
        updates.fundActivityPollSeconds = v;
      }
    }

    const tplFields = ["tplDonation", "tplRewards", "tplPurchase", "tplBatch", "tplFeedingProof"] as const;
    tplFields.forEach((field) => {
      if (body[field] !== undefined && typeof body[field] === "string") {
        (updates as Record<string, string>)[field] = body[field];
      }
    });

    if (body.partners !== undefined) {
      if (!Array.isArray(body.partners)) {
        return NextResponse.json({ error: "Invalid partners" }, { status: 400 });
      }
      updates.partners = body.partners.map((p: unknown) => ({
        name: String((p as Partner).name || ""),
        description: String((p as Partner).description || ""),
        href: String((p as Partner).href || ""),
        icon: ["Cat", "Home", "PawPrint", "Shield", "Heart"].includes(String((p as Partner).icon))
          ? (String((p as Partner).icon) as Partner["icon"])
          : "Cat",
        logo: String((p as Partner).logo || ""),
        socials: {
          instagram: String(((p as Partner).socials as Partner["socials"])?.instagram || ""),
          facebook: String(((p as Partner).socials as Partner["socials"])?.facebook || ""),
          tiktok: String(((p as Partner).socials as Partner["socials"])?.tiktok || ""),
        },
      }));
    }

    const updated = saveSettings(updates);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
