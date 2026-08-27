import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === `Bearer ${adminPassword}`;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const type = (formData.get("type") as string) || "photo";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const baseName = `${Date.now()}-${sanitizedName.replace(/\.[^/.]+$/, "")}`;

    if (type === "logo") {
      // Logo: preserve PNG for transparency, no thumbnail
      const fullName = `${baseName}.png`;
      const fullPath = path.join(uploadDir, fullName);

      await sharp(buffer)
        .resize({ width: 500, withoutEnlargement: true })
        .png()
        .toFile(fullPath);

      const publicPath = `/uploads/${folder}/${fullName}`;
      return NextResponse.json({
        success: true,
        path: publicPath,
        thumbPath: publicPath,
        filename: fullName,
      });
    }

    const ext = ".jpg";

    const fullName = `${baseName}${ext}`;
    const thumbName = `thumb-${baseName}${ext}`;
    const fullPath = path.join(uploadDir, fullName);
    const thumbPath = path.join(uploadDir, thumbName);

    if (type === "receipt") {
      // Receipt: compress, max 1200px width, quality 80
      await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(fullPath);
    } else if (type === "background") {
      // Hero background: large, high quality, no thumbnail
      await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 82, progressive: true })
        .toFile(fullPath);
    } else {
      // Photo: compress full size + create thumbnail
      await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(fullPath);

      await sharp(buffer)
        .resize({ width: 300, height: 300, fit: "cover", withoutEnlargement: true })
        .jpeg({ quality: 75, progressive: true })
        .toFile(thumbPath);
    }

    const publicPath = `/uploads/${folder}/${fullName}`;
    const thumbPublicPath = type === "photo" ? `/uploads/${folder}/${thumbName}` : publicPath;

    return NextResponse.json({
      success: true,
      path: publicPath,
      thumbPath: thumbPublicPath,
      filename: fullName,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
