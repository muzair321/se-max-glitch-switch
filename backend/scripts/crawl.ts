import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as cheerio from "cheerio";
import "dotenv/config";
import { parseSize } from "../src/lib/units.js";

type StoreId = "alfatah";
type Listing = { id: string; category: string; aliases: string[]; brand: string | null; storeId: StoreId; unit: "g" | "ml" | "piece"; packageQuantity: number; packageLabel: string; price: number; productName: string; productUrl: string; imageUrl: string | null; available: boolean };
const sources: Array<{ id: StoreId; name: string; urls: string[] }> = [
  { id: "alfatah", name: "Al-Fatah", urls: (process.env.ALFATAH_CATALOGUE_URL ?? "").split(",").map((url) => url.trim()).filter(Boolean) },
];

function parseListings(storeId: StoreId, html: string, baseUrl: string): Listing[] {
  if (storeId === "alfatah" && baseUrl.includes("products.json")) return parseAlFatahFeed(JSON.parse(html), baseUrl);
  const $ = cheerio.load(html);
  const results: Listing[] = [];
  $("script[type='application/ld+json']").each((_index, element) => {
    const raw = $(element).text();
    try {
      const values = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [JSON.parse(raw)];
      for (const value of values) {
        if (value?.['@type'] !== "Product" || !value.name || !value.offers?.price) continue;
        const price = Number(value.offers.price);
        if (!Number.isFinite(price) || price <= 0) continue;
        results.push({ id: `${storeId}-${value.sku ?? value.url ?? value.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"), category: "unknown", aliases: [String(value.name).toLowerCase()], brand: value.brand?.name ?? null, storeId, unit: "piece", packageQuantity: 1, packageLabel: "1 piece", price, productName: String(value.name), productUrl: new URL(value.url ?? baseUrl, baseUrl).toString(), imageUrl: value.image ?? null, available: value.offers.availability !== "https://schema.org/OutOfStock" });
      }
    } catch { /* Ignore malformed structured data and continue the crawl. */ }
  });
  return results;
}

function parseAlFatahFeed(feed: { products?: Array<{ id: number; title: string; handle: string; vendor?: string; images?: Array<{ src?: string }>; variants?: Array<{ id: number; title: string; price: string; available: boolean }> }> }, baseUrl: string): Listing[] {
  const results: Listing[] = [];
  for (const product of feed.products ?? []) {
    for (const variant of product.variants ?? []) {
      const size = parseSize(`${product.title} ${variant.title}`);
      const price = Number(variant.price);
      if (!size || !Number.isFinite(price) || price <= 0) continue;
      const name = product.title.trim();
      const normalized = name.toLowerCase();
      const hasTerm = (...terms: string[]) => terms.some((term) => new RegExp(`(^|[^a-z])${term}(?=$|[^a-z])`, "i").test(normalized));
      const sugarProduct = hasTerm("sugar", "cheeni") && !hasTerm("free") && !normalized.includes("no added sugar") && !normalized.includes("without sugar");
      const category = hasTerm("noodle", "noodles", "pasta") ? "noodles" : hasTerm("rice", "basmati") && !hasTerm("flour") ? "rice" : hasTerm("oil", "ghee") ? "oil" : hasTerm("egg", "eggs") && !hasTerm("noodle", "noodles") ? "eggs" : hasTerm("flour", "atta", "aata", "maida") ? "flour" : sugarProduct ? "sugar" : hasTerm("tea", "chai") ? "tea" : hasTerm("salt", "namak") ? "salt" : hasTerm("biscuit", "biscuits") ? "biscuits" : hasTerm("cereal", "flakes") ? "cereal" : hasTerm("bread", "bun", "roti") ? "bread" : hasTerm("butter", "makhan") ? "butter" : hasTerm("chicken", "murghi") ? "chicken" : "grocery";
      results.push({ id: `alfatah-${product.id}-${variant.id}`, category, aliases: [normalized], brand: product.vendor?.trim() || null, storeId: "alfatah", unit: size.unit, packageQuantity: size.quantity, packageLabel: `${size.quantity}${size.unit}`, price, productName: name, productUrl: new URL(`/products/${product.handle}`, baseUrl).toString(), imageUrl: product.images?.[0]?.src ?? null, available: variant.available });
    }
  }
  return results;
}

async function crawlStore(source: typeof sources[number], url: string) {
  const response = await fetch(url, { headers: { "user-agent": "BachatBasket/0.1 (+price-snapshot)", accept: "application/json" } });
  if (!response.ok) throw new Error(`${source.id} returned HTTP ${response.status}`);
  return parseListings(source.id, await response.text(), url);
}

const results = await Promise.all(sources.map(async (source) => {
  const batches = await Promise.all(source.urls.map(async (url) => {
    try { return await crawlStore(source, url); }
    catch (error) { console.error(`${url}: ${error instanceof Error ? error.message : "feed failed"}`); return []; }
  }));
  const items = [...new Map(batches.flat().map((item) => [item.id, item])).values()];
  console.log(`${source.name}: accepted ${items.length} listings from ${source.urls.length} feeds`);
  return items;
}));
const listings = results.flat();
if (results.some((items) => items.length === 0)) throw new Error("One or more supported stores produced no listings; cached snapshot was not changed.");
const snapshot = { snapshotDate: new Date().toISOString(), currency: "PKR", stores: sources.map(({ id, name }) => ({ id, name, deliveryFee: 40, minimumOrder: 500 })), offers: listings };
await writeFile(resolve(process.cwd(), "data/catalogue.json"), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${listings.length} listings to data/catalogue.json`);