import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import type { Listing, StoreInfo, Unit } from "./types.js";

const allowedStoreIds = ["alfatah"] as const;
const rawOfferSchema = z.object({
  id: z.string(), category: z.string(), aliases: z.array(z.string()).default([]), brand: z.string().nullable(),
  storeId: z.literal("alfatah"), unit: z.string(),
  packageQuantity: z.number().positive(), packageLabel: z.string(), price: z.number().positive(),
  productName: z.string().optional(), productUrl: z.string().optional(), imageUrl: z.string().nullable().optional(), available: z.boolean().optional(),
});
const snapshotSchema = z.object({
  snapshotDate: z.string(), currency: z.literal("PKR"),
  stores: z.array(z.object({ id: z.string(), name: z.string(), deliveryFee: z.number().nonnegative(), minimumOrder: z.number().nonnegative() })),
  offers: z.array(rawOfferSchema),
});

export interface Catalogue { snapshotDate: string; currency: "PKR"; stores: StoreInfo[]; listings: Listing[] }

function toUnit(value: string): Unit | null {
  if (value === "g" || value === "ml" || value === "piece") return value;
  return null;
}

export async function loadCatalogue(filePath = resolve(process.cwd(), "data/catalogue.json")): Promise<Catalogue> {
  const parsed = snapshotSchema.parse(JSON.parse(await readFile(filePath, "utf8")));
  const stores = parsed.stores.filter((store) => allowedStoreIds.includes(store.id as typeof allowedStoreIds[number])).map((store) => ({
    id: store.id, name: store.name, deliveryFee: store.deliveryFee, minimumOrder: store.minimumOrder, freeDeliveryOver: null,
  }));
  const validStoreIds = new Set(stores.map((store) => store.id));
  const listings = parsed.offers.flatMap((offer) => {
    const unit = toUnit(offer.unit);
    if (!unit || !validStoreIds.has(offer.storeId)) return [];
    const store = stores.find((candidate) => candidate.id === offer.storeId);
    if (!store) return [];
    return [{
      id: offer.id, storeId: "alfatah", productName: offer.productName ?? offer.category,
      normalizedName: offer.aliases[0] ?? offer.category, brand: offer.brand, category: offer.category,
      aliases: offer.aliases, packageQuantity: offer.packageQuantity, unit, packageLabel: offer.packageLabel,
      price: offer.price, store: store.name, storeMinimumOrder: (parsed.stores.find((item) => item.id === offer.storeId)?.minimumOrder ?? 0),
      available: offer.available ?? true, productUrl: offer.productUrl ?? "", imageUrl: offer.imageUrl ?? null, checkedAt: parsed.snapshotDate, source: "cached" as const,
    } satisfies Listing];
  });
  return { snapshotDate: parsed.snapshotDate, currency: parsed.currency, stores, listings };
}