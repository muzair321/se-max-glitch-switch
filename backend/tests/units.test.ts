import { describe, it, expect } from "vitest";
import { parseSize } from "../src/lib/units";

describe("parseSize", () => {
  it("reads multipacks", () => {
    expect(parseSize("Ok Cooking Oil (North) 1L x 5")).toMatchObject({ quantity: 5000, unit: "ml", packs: 5 });
  });
  it("reads kg", () => {
    expect(parseSize("GUARD ULTIMATE BASMATI RICE 5 KG")).toMatchObject({ quantity: 5000, unit: "g" });
  });
  it("reads grams", () => {
    expect(parseSize("Wah Moong Dal 200GM")).toMatchObject({ quantity: 200, unit: "g" });
  });
  it("returns null with no size", () => {
    expect(parseSize("Default Title")).toBeNull();
  });
});