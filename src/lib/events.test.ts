import { describe, expect, it } from "vitest";
import { upcomingCityEvents, formatEventDate, eventInputToIso } from "./events";

const now = new Date("2026-11-04T12:00:00Z");

describe("upcomingCityEvents", () => {
  it("saves optional time and date-only values in Aktau UTC+5", () => {
    expect(eventInputToIso("2026-11-13")).toBe("2026-11-12T19:00:00.000Z");
    expect(eventInputToIso("2026-11-07T13:00")).toBe("2026-11-07T08:00:00.000Z");
  });
  it("keeps a November 7 event until midnight in Aktau, not only until its start", () => {
    const list = [{ city: "Актау", event_date: "2026-11-07T13:00:00+05:00" }];
    expect(upcomingCityEvents(list, "Актау", new Date("2026-11-07T18:59:59Z"))).toHaveLength(1);
    expect(upcomingCityEvents(list, "Актау", new Date("2026-11-07T19:00:00Z"))).toHaveLength(0);
  });

  it("keeps the November 7–8 championship through the entire end date", () => {
    const list = [{ city: "Актау", event_date: "2026-11-07T00:00:00+05:00", event_end_date: "2026-11-08" }];
    expect(upcomingCityEvents(list, "Актау", new Date("2026-11-08T18:59:59Z"))).toHaveLength(1);
    expect(upcomingCityEvents(list, "Актау", new Date("2026-11-08T19:00:00Z"))).toHaveLength(0);
  });

  it("formats a date range without midnight", () => {
    expect(formatEventDate("2026-11-07T00:00:00+05:00", "2026-11-08", "ru")).toBe("7–8 ноября");
  });

  it("shows only the November 13 date when XAN KIDS time is unspecified", () => {
    expect(formatEventDate("2026-11-13T00:00:00+05:00", null, "ru")).toBe("13 ноября");
  });

  it("retains the stated 13:00 time in Aktau", () => {
    expect(formatEventDate("2026-11-07T13:00:00+05:00", null, "ru")).toBe("7 ноября, 13:00");
  });
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
