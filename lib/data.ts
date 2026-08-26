import fs from "fs";
import path from "path";

export type BatchEssentials = {
  name: string;
  price: string;
  tx: string;
};

export type Batch = {
  id: number;
  name: string;
  status: string;
  startDate: string;
  targetDate: string;
  fees: string;
  cats: string;
  food: string;
  txHash: string;
  isActive: boolean;
  receiptImages: string[];
  receiptStore: string;
  receiptItem: string;
  receiptTotal: string;
  notes: string;
  photos: string[];
  essentials: BatchEssentials[];
};

const dataFilePath = path.join(process.cwd(), "data", "batches.json");

export function getBatches(): Batch[] {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    const batches = JSON.parse(data) as (Batch & { receiptImage?: string })[];
    return batches.map((b) => {
      const normalized: Batch = {
        ...b,
        receiptImages:
          Array.isArray(b.receiptImages) && b.receiptImages.length > 0
            ? b.receiptImages
            : b.receiptImage
            ? [b.receiptImage]
            : [],
        essentials: (Array.isArray(b.essentials) ? b.essentials : []).map((e) => {
          const item = e as Record<string, unknown>;
          return {
            name: typeof item.name === "string" ? item.name : "",
            price: typeof item.price === "string" ? item.price : "",
            tx: typeof item.tx === "string" ? item.tx : "",
          };
        }),
      };
      return normalized;
    });
  } catch {
    return [];
  }
}

export function getStats() {
  const batches = getBatches();
  const completed = batches.filter((b) => b.status === "Completed");

  const totalFees = completed.reduce((sum, b) => {
    const num = Number(b.fees.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const totalCats = completed.reduce((sum, b) => {
    const num = Number(b.cats);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const totalFood = completed.reduce((sum, b) => {
    const num = Number(b.food.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return {
    totalCats,
    totalFees,
    totalFood,
    feedingRounds: completed.length,
  };
}

export type PhotoWithBatch = {
  url: string;
  batchId: number;
  batchName: string;
  batchDate: string;
};

export function getAllPhotos(): PhotoWithBatch[] {
  const batches = getBatches();
  return batches.flatMap((b) =>
    b.photos.map((photo) => ({
      url: photo,
      batchId: b.id,
      batchName: b.name,
      batchDate: b.targetDate,
    }))
  );
}
