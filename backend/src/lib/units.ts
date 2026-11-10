import type { Unit } from "./types";

export interface ParsedSize {
  quantity: number; // total, in g, ml or pieces
  unit: Unit;
  packs: number;
}

const UNITS: Record<string, { unit: Unit; factor: number }> = {
  kg: { unit: "g", factor: 1000 }, kgs: { unit: "g", factor: 1000 },
  g: { unit: "g", factor: 1 }, gm: { unit: "g", factor: 1 }, gms: { unit: "g", factor: 1 },
  gram: { unit: "g", factor: 1 }, grams: { unit: "g", factor: 1 },
  l: { unit: "ml", factor: 1000 }, ltr: { unit: "ml", factor: 1000 }, ltrs: { unit: "ml", factor: 1000 },
  litre: { unit: "ml", factor: 1000 }, litres: { unit: "ml", factor: 1000 },
  liter: { unit: "ml", factor: 1000 }, liters: { unit: "ml", factor: 1000 },
  ml: { unit: "ml", factor: 1 },
  dozen: { unit: "piece", factor: 12 },
  pc: { unit: "piece", factor: 1 }, pcs: { unit: "piece", factor: 1 },
  piece: { unit: "piece", factor: 1 }, pieces: { unit: "piece", factor: 1 },
};

const SIZE_RE =
  /(\d+(?:\.\d+)?)\s*(kgs|kg|gms|gm|grams|gram|g|ltrs|ltr|litres|litre|liters|liter|l|ml|dozen|pcs|pc|pieces|piece)\b(?:\s*[x×]\s*(\d+))?/i;

// Returns the first size found in the text, or null if there is none.
export function parseSize(text: string): ParsedSize | null {
  const m = text.replace(/,/g, "").match(SIZE_RE);
  if (!m) return null;
  const entry = UNITS[m[2].toLowerCase()];
  const packs = m[3] ? Number(m[3]) : 1;
  return { quantity: Number(m[1]) * entry.factor * packs, unit: entry.unit, packs };
}