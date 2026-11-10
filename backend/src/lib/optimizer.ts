import { parseSize } from "./units.js";
import type { Listing, StoreInfo, Unit } from "./types.js";

export interface BasketRequest { items: { text: string }[]; budget?: number; excludedBrands?: string[] }
export interface ParsedRequest { text: string; query: string; quantity: number; unit: Unit | null; exactQuantity: boolean }
export interface BasketResult { status: "within_budget" | "over_budget" | "no_valid_basket"; total: number; productTotal: number; deliveryTotal: number; storesUsed: number; snapshotDate: string; items: Array<Listing & { packages: number; coveredQuantity: number }>; stores: Array<StoreInfo & { subtotal: number; deliveryFeeApplied: number }>; warnings: string[] }
type Candidate = { selected: BasketResult["items"]; storeResults: BasketResult["stores"]; productTotal: number; deliveryTotal: number; total: number };

const aliases = [
  "cooking oil", "oil", "tel", "flour", "atta", "aata", "maida", "rice", "basmati", "chawal",
  "eggs", "egg", "anday", "anda", "sugar", "cheeni", "tea", "chai", "salt", "namak", "biscuit", "biscuits",
  "cereal", "corn flakes", "noodles", "pasta", "bread", "roti", "butter", "makhan", "chicken", "murghi",
  "milk", "doodh", "yogurt", "dahi", "water", "pani", "juice", "lentils", "daal", "dal", "spices", "masala",
];

function findQuery(text: string): string {
  const normalized = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim()
    .replace(/^\d+(?:\.\d+)?\s*(?:x\s*)?/, "")
    .replace(/\b\d+(?:\.\d+)?\s*(?:kgs?|kilos?|gms?|grams?|g|litres?|liters?|l|ml|dozen|pcs?|pieces?)\b/g, " ")
    .replace(/\b(?:kgs?|kilos?|gms?|grams?|g|litres?|liters?|l|ml|dozen|pcs?|pieces?)\b/g, " ")
    .replace(/\b(?:please|buy|need|get|some|of|a|an)\b/g, " ")
    .replace(/\s+/g, " ").trim();
  const canonical = canonicalQueries[normalized];
  if (canonical) return canonical;
  const matchingAlias = [...aliases].sort((a, b) => b.length - a.length).find((alias) => normalized === alias);
  return canonicalQueries[matchingAlias ?? ""] ?? matchingAlias ?? normalized;
}

  function matchesQuery(value: string, query: string): boolean {
    const normalizedValue = value.toLowerCase();
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return false;
    return normalizedQuery.split(/\s+/).every((token) => {
      const queryPattern = token.endsWith("s") ? `${token.slice(0, -1)}s?` : token;
      return new RegExp(`(^|[^a-z])${queryPattern}(?=$|[^a-z])`, "i").test(normalizedValue);
    });
  }

  const categoryQueries = new Set(["rice", "oil", "flour", "sugar", "tea", "salt", "biscuits", "cereal", "noodles", "bread", "butter", "chicken", "eggs", "milk", "yogurt", "water", "juice", "lentils", "spices"]);

  const countQueries = new Set(["egg", "eggs", "anda", "anday", "chicken", "murghi"]);
  const canonicalQueries: Record<string, string> = { chawal: "rice", basmati: "rice", tel: "oil", anda: "eggs", anday: "eggs", chai: "tea", namak: "salt", makhan: "butter", murghi: "chicken", doodh: "milk", dahi: "yogurt", pani: "water", daal: "lentils", dal: "lentils", masala: "spices", atta: "flour", aata: "flour", maida: "flour", cheeni: "sugar" };

export function parseRequests(items: { text: string }[]): ParsedRequest[] {
  const parsed = items.map(({ text }) => ({ text: text.trim() })).filter(({ text }) => text.length > 0).map(({ text }) => {
    const size = parseSize(text);
    const leadingQuantity = text.match(/^(\d+(?:\.\d+)?)\s+/)?.[1];
     if (/^-\d/.test(text)) throw new Error(`Quantity must be positive: ${text}`);
    const rawQuery = findQuery(text);
    const query = canonicalQueries[rawQuery] ?? rawQuery;
    return { text, query, quantity: size?.quantity ?? Number(leadingQuantity ?? 1), unit: size?.unit ?? (leadingQuantity && countQueries.has(query) ? "piece" : null), exactQuantity: Boolean(size?.unit === "piece" || (leadingQuantity && countQueries.has(query))) };
  });
  if (!parsed.length) throw new Error("Add at least one grocery item.");
  return parsed;
}

export function optimize(request: BasketRequest, listings: Listing[], stores: StoreInfo[], snapshotDate: string): BasketResult {
  const parsed = parseRequests(request.items);
  const excluded = new Set((request.excludedBrands ?? []).map((brand) => brand.trim().toLowerCase()).filter(Boolean));
  const warnings: string[] = [];
  const choices: Array<Array<{ listing: Listing; packages: number }>> = [];
  for (const item of parsed) {
    const candidates = listings.filter((listing) => {
      if (!listing.available || (item.unit !== null && listing.unit !== item.unit) || excluded.has((listing.brand ?? "").toLowerCase())) return false;
      if (categoryQueries.has(item.query)) return listing.category === item.query;
      return [listing.productName, listing.normalizedName, ...listing.aliases].some((value) => matchesQuery(value, item.query));
    });
    if (!candidates.length) { warnings.push(`No valid catalogue match for "${item.text}".`); continue; }
    choices.push(candidates.map((listing) => ({ listing, packages: item.unit === null ? 1 : Math.ceil(item.quantity / listing.packageQuantity), score: (listing.productName.toLowerCase() === item.query ? 3 : 0) + (listing.category === item.query ? 2 : 0) })).filter(({ listing, packages }) => !item.exactQuantity || packages * listing.packageQuantity === item.quantity).sort((a, b) => b.score - a.score || a.packages * a.listing.price - b.packages * b.listing.price).map(({ listing, packages }) => ({ listing, packages })));
  }
  if (choices.length !== parsed.length) return { status: "no_valid_basket", total: 0, productTotal: 0, deliveryTotal: 0, storesUsed: 0, snapshotDate, items: [], stores: [], warnings };
  let best: Candidate | null = null;
  function evaluate(index: number, current: BasketResult["items"]) {
    if (index < choices.length) {
      for (const choice of choices[index]) evaluate(index + 1, [...current, { ...choice.listing, packages: choice.packages, coveredQuantity: choice.packages * choice.listing.packageQuantity }]);
      return;
    }
    const storeResults = stores.map((store) => {
      const products = current.filter((item) => item.storeId === store.id);
      const subtotal = products.reduce((sum, item) => sum + item.packages * item.price, 0);
      return { ...store, subtotal, deliveryFeeApplied: products.length ? store.deliveryFee : 0 };
    }).filter((store) => store.subtotal > 0);
    if (storeResults.some((store) => store.subtotal < store.minimumOrder)) return;
    const productTotal = current.reduce((sum, item) => sum + item.packages * item.price, 0);
    const deliveryTotal = storeResults.reduce((sum, store) => sum + store.deliveryFeeApplied, 0);
    const total = productTotal + deliveryTotal;
    const candidate = { selected: current, storeResults, productTotal, deliveryTotal, total };
    if (!best || total < best.total || (total === best.total && storeResults.length < best.storeResults.length)) best = candidate;
  }
  evaluate(0, []);
  if (!best) return { status: "no_valid_basket", total: 0, productTotal: 0, deliveryTotal: 0, storesUsed: 0, snapshotDate, items: [], stores: [], warnings: ["No combination satisfies store minimum orders."] };
  const winning: Candidate = best!;
  const selected = winning.selected;
  const storeResults = winning.storeResults;
  const productTotal = winning.productTotal;
  const deliveryTotal = winning.deliveryTotal;
  const total = winning.total;
  return { status: request.budget !== undefined && total > request.budget ? "over_budget" : "within_budget", total, productTotal, deliveryTotal, storesUsed: storeResults.length, snapshotDate, items: selected, stores: storeResults, warnings };
}