import { describe, expect, it } from "vitest";
import { mapAddressQueries, mapCoordinates } from "./mapLocation";

describe("map locations", () => {
  it("uses stored coordinates and 2GIS coordinates without geocoding", () => {
    expect(mapCoordinates({ latitude: 43.65, longitude: 51.17 })).toEqual({ lat: 43.65, lng: 51.17 });
    expect(mapCoordinates({ twogis_url: "https://2gis.kz/aktau?m=51.17,43.65/16" })).toEqual({ lat: 43.65, lng: 51.17 });
  });
  it("skips phone numbers and supplies a neighborhood fallback for Aktau addresses", () => {
    expect(mapAddressQueries("77752613684", "Актау")).toEqual([]);
    expect(mapAddressQueries("20 мкр., 12 дом", "Актау")).toEqual(["20 микрорайон, 12 дом, Актау, Казахстан", "20 микрорайон, Актау, Казахстан"]);
  });
});