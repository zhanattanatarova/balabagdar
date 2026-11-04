import { describe, expect, it } from "vitest";
import { upcomingCityEvents } from "./events";

const now = new Date("2026-11-04T12:00:00Z");

describe("upcomingCityEvents", () => {
  it("keeps only events in the selected city", () => {
    const list = [
      { id: 1, city: "Актау", event_date: "2026-11-10T10:00:00Z" },
      { id: 2, city: "Астана", event_date: "2026-11-10T10:00:00Z" },
    ];
    expect(upcomingCityEvents(list, "Актау", now).map((e) => e.id)).toEqual([1]);
  });

  it("drops events whose date has already passed", () => {
    const list = [
      { id: 1, city: "Актау", event_date: "2026-11-01T10:00:00Z" },
      { id: 2, city: "Актау", event_date: "2026-11-05T10:00:00Z" },
    ];
    expect(upcomingCityEvents(list, "Актау", now).map((e) => e.id)).toEqual([2]);
  });

  it("returns nothing when the city has no upcoming events", () => {
    const list = [{ id: 1, city: "Актау", event_date: "2026-10-01T10:00:00Z" }];
    expect(upcomingCityEvents(list, "Актау", now)).toEqual([]);
  });
});
