export type Unit = "g" | "ml" | "piece";

export interface Listing {
  id: string;
  productName: string;
  brand: string | null;
  category: string;
  packageQuantity: number; // in g, ml or pieces
  unit: Unit;
  price: number; // PKR
  store: string;
  available: boolean;
  productUrl: string;
  checkedAt: string; // ISO time
  source: "live" | "cached";
}

export interface StoreInfo {
  id: string;
  name: string;
  deliveryFee: number;
  freeDeliveryOver: number | null;
}