import { describe, expect, it } from "vitest";
import { clubAge, clubCategoryLabels, clubPrice, uniqueCategories } from "./clubDisplay";
import { parseCoordinates } from "./coords";

const translate = (key: string) => ({ "development.aba": "ABA-терапия", "special.aba": "ABA-терапия", "cat.swim": "Плавание" } as Record<string, string>)[key] ?? key;

describe("club card rules", () => {
  it("shows 'Возраст уточняйте' when age is missing", () => {
    expect(clubAge(null, null, "ru")).toBe("Возраст уточняйте");
  });
  it("treats the old 3–18 default as not specified", () => {
    expect(clubAge(3, 18, "ru")).toBe("Возраст уточняйте");
  });
  it("shows a real age range", () => {
    expect(clubAge(4, 10, "ru")).toBe("4–10 лет");
  });
  it("shows price as 'от X ₸' only when set", () => {
    expect(clubPrice(15000, "₸", "ru")).toBe("от 15\u00a0000 ₸");
    expect(clubPrice(0, "₸", "ru")).toBe("");
    expect(clubPrice(null, "₸", "ru")).toBe("");
  });
  it("does not show the same tag twice", () => {
    const labels = clubCategoryLabels(["development.aba", "special.aba", "swim"], translate);
    expect(labels.map((l) => l.label)).toEqual(["ABA-терапия", "Плавание"]);
  });
  it("removes duplicate category ids before saving", () => {
    expect(uniqueCategories(["swim", "swim", "special.aba"])).toEqual(["swim", "special.aba"]);
  });
});

describe("coordinates from map links", () => {
  it("reads Google Maps place links", () => {
    expect(parseCoordinates("https://www.google.com/maps/place/X/@43.6,51.1,17z/data=!3d43.6512!4d51.1734")).toEqual({ lat: 43.6512, lng: 51.1734 });
  });
  it("reads 2GIS links (lng,lat order)", () => {
    expect(parseCoordinates("https://2gis.kz/aktau/geo/70000001/51.1734,43.6512")).toEqual({ lat: 43.6512, lng: 51.1734 });
    expect(parseCoordinates("https://2gis.kz/aktau?m=51.1734%2C43.6512%2F16")).toEqual({ lat: 43.6512, lng: 51.1734 });
  });
  it("reads plain 'lat, lng'", () => {
    expect(parseCoordinates("43.6512, 51.1734")).toEqual({ lat: 43.6512, lng: 51.1734 });
  });
  it("returns null for short links without coordinates", () => {
    expect(parseCoordinates("https://maps.app.goo.gl/abc123")).toBeNull();
  });
});
