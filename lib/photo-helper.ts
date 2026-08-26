import fs from "fs";
import path from "path";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export function readPhotoFile(photoPath: string): Blob | null {
  try {
    const filePath = path.join(process.cwd(), "public", photoPath);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "image/jpeg";
    return new Blob([buffer], { type });
  } catch {
    return null;
  }
}
