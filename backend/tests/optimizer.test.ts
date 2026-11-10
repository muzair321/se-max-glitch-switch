import { describe, expect, it } from "vitest";
import { optimize, parseRequests } from "../src/lib/optimizer.js";
import type { Listing, StoreInfo } from "../src/lib/types.js";

const stores: StoreInfo[] = [{ id: "alfatah", name: "Al-Fatah", deliveryFee: 40, minimumOrder: 0, freeDeliveryOver: null }];
const listing = (overrides: Partial<Listing>): Listing => ({ id: "rice", storeId: "alfatah", productName: "Rice", normalizedName: "rice", aliases: ["rice"], brand: "Test", category: "rice", packageQuantity: 1000, unit: "g", packageLabel: "1 kg", price: 300, store: "Al-Fatah", storeMinimumOrder: 500, available: true, productUrl: "", imageUrl: null, checkedAt: "2026-01-01", source: "cached", ...overrides });

describe("basket optimizer", () => {
  it("normalizes kg and dozen quantities", () => expect(parseRequests([{ text: "2 kg rice" }, { text: "1 dozen eggs" }])).toEqual([{ text: "2 kg rice", query: "rice", quantity: 2000, unit: "g", exactQuantity: false }, { text: "1 dozen eggs", query: "eggs", quantity: 12, unit: "piece", exactQuantity: true }]));
  it("treats a bare dozen as twelve pieces", () => expect(parseRequests([{ text: "dozen eggs" }])).toEqual([{ text: "dozen eggs", query: "eggs", quantity: 12, unit: "piece", exactQuantity: true }]));
  it("defaults an item without a quantity to one package", () => expect(parseRequests([{ text: "rice" }])).toEqual([{ text: "rice", query: "rice", quantity: 1, unit: null, exactQuantity: false }]));
  it("treats a unitless count item as pieces", () => expect(parseRequests([{ text: "2 eggs" }])).toEqual([{ text: "2 eggs", query: "eggs", quantity: 2, unit: "piece", exactQuantity: true }]));
  it("ignores blank lines and canonicalizes Roman Urdu aliases", () => expect(parseRequests([{ text: "  " }, { text: "1 kilo chawal" }])).toEqual([{ text: "1 kilo chawal", query: "rice", quantity: 1000, unit: "g", exactQuantity: false }]));
  it("normalizes leading multipacks", () => expect(parseRequests([{ text: "2 x 500g rice" }])).toEqual([{ text: "2 x 500g rice", query: "rice", quantity: 1000, unit: "g", exactQuantity: false }]));
  it("does not replace 12 eggs with a 30-pack", () => {
    const result = optimize({ items: [{ text: "12 eggs" }] }, [listing({ category: "eggs", normalizedName: "eggs", aliases: ["eggs"], unit: "piece", packageQuantity: 12, packageLabel: "12 pieces" }), listing({ id: "large-eggs", category: "eggs", normalizedName: "eggs", aliases: ["eggs"], unit: "piece", packageQuantity: 30, packageLabel: "30 pieces", price: 600 })], stores, "2026-01-01");
    expect(result.items[0].packageQuantity).toBe(12);
  });
  it("matches specific chicken cuts instead of the cheapest chicken product", () => {
    const products = [
      listing({ id: "liver", category: "chicken", productName: "Chicken Liver", normalizedName: "chicken liver", aliases: ["chicken liver"], price: 200 }),
      listing({ id: "neck", category: "chicken", productName: "Chicken Neck", normalizedName: "chicken neck", aliases: ["chicken neck"], price: 300 }),
      listing({ id: "breast", category: "chicken", productName: "Chicken Breast Boneless", normalizedName: "chicken breast boneless", aliases: ["chicken breast boneless"], price: 700 }),
    ];
    expect(optimize({ items: [{ text: "chicken neck" }] }, products, stores, "2026-01-01").items[0].productName).toBe("Chicken Neck");
    expect(optimize({ items: [{ text: "chicken breast" }] }, products, stores, "2026-01-01").items[0].productName).toBe("Chicken Breast Boneless");
    expect(optimize({ items: [{ text: "chicken liver" }] }, products, stores, "2026-01-01").items[0].productName).toBe("Chicken Liver");
  });
  it("returns no match instead of substituting an unavailable specific item", () => {
    const result = optimize({ items: [{ text: "chicken neck" }] }, [listing({ category: "chicken", productName: "Chicken Liver", normalizedName: "chicken liver", aliases: ["chicken liver"] })], stores, "2026-01-01");
    expect(result.status).toBe("no_valid_basket");
  });
  it("buys whole packages and includes delivery", () => {
    const result = optimize({ items: [{ text: "2 kg rice" }] }, [listing({ packageQuantity: 1000, price: 300 })], stores, "2026-01-01");
    expect(result.total).toBe(640);
    expect(result.items[0].packages).toBe(2);
  });
  it("never selects an excluded brand", () => {
    const result = optimize({ items: [{ text: "1 kg rice" }], excludedBrands: ["Test"] }, [listing({})], stores, "2026-01-01");
    expect(result.status).toBe("no_valid_basket");
  });
  it("reports an over-budget basket", () => {
    const result = optimize({ items: [{ text: "1 kg rice" }], budget: 100 }, [listing({})], stores, "2026-01-01");
    expect(result.status).toBe("over_budget");
  });
});