import { describe, it, expect } from "vitest";
import { popularSort, reliableRating } from "./popular";

describe("popular clubs", () => {
  it("excludes clubs rated below 3.5", () => {
    const r = popularSort([{ id: "debut", twogis_rating: 1.9, twogis_reviews_count: 1 }, { id: "ok", twogis_rating: 4.8, twogis_reviews_count: 20 }]);
    expect(r.map((c) => c.id)).toEqual(["ok"]);
  });
  it("weights 2GIS rating by review count", () => {
    expect(reliableRating({ twogis_rating: 5, twogis_reviews_count: 10 })).toBe(4.75);
  });
  it("prefers many good reviews over one perfect review", () => {
    const r = popularSort([{ id: "one", twogis_rating: 5, twogis_reviews_count: 1 }, { id: "many", twogis_rating: 4.9, twogis_reviews_count: 100 }]);
    expect(r[0].id).toBe("many");
  });
});
