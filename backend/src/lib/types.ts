export type Unit = "g" | "ml" | "piece";

export interface Listing {
  id: string;
  storeId: "alfatah";
  productName: string;
  normalizedName: string;
  aliases: string[];
  brand: string | null;
  category: string;
  packageQuantity: number; // in g, ml or pieces
  unit: Unit;
  packageLabel: string;
  price: number; // PKR
  store: string;
  storeMinimumOrder: number;
  available: boolean;
  productUrl: string;
  imageUrl: string | null;
  checkedAt: string; // ISO time
  source: "live" | "cached";
}

export interface StoreInfo {
  id: string;
  name: string;
  deliveryFee: number;
  minimumOrder: number;
  freeDeliveryOver: number | null;
}