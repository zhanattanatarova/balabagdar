import { describe, expect, it } from "vitest";
import { hasTwoGisRating, formatTwoGisRating, twoGisReviewsLabel, twoGisReviewsUrl } from "./twogis";

describe("2GIS badge", () => {
  it("shows only when a 2GIS rating exists", () => {
    expect(hasTwoGisRating(null)).toBe(false);
    expect(hasTwoGisRating(4.9)).toBe(true);
  });

  it("formats the rating with one decimal", () => {
    expect(formatTwoGisRating(5)).toBe("5.0");
    expect(formatTwoGisRating("4.9")).toBe("4.9");
  });

  it("labels reviews in each language", () => {
    expect(twoGisReviewsLabel(39, "ru")).toBe("39 отзывов в 2GIS");
    expect(twoGisReviewsLabel(39, "kz")).toBe("2GIS-те 39 пікір");
    expect(twoGisReviewsLabel(39, "en")).toBe("39 reviews on 2GIS");
  });

  it("links to the 2GIS reviews tab", () => {
    expect(twoGisReviewsUrl("https://2gis.kz/aktau/firm/70000001077526451")).toBe(
      "https://2gis.kz/aktau/firm/70000001077526451/tab/reviews",
    );
    expect(twoGisReviewsUrl("javascript:alert(1)")).toBeNull();
  });
});
