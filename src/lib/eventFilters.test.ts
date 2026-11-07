import { describe, expect, it } from "vitest";
import { matchesEventFilters, dateWindow, type EventFilters } from "./events";

const base: EventFilters = { date: "all", age: null, price: null, kind: null };
const sat = new Date("2026-11-07T12:00:00Z"); // Saturday 17:00 Aktau
const chess = { city: "Актау", event_date: "2026-11-06T19:00:00Z", event_end_date: "2026-11-08", age_min: 0, age_max: 5, event_kind: "competition" };
const pizza = { city: "Актау", event_date: "2026-11-12T19:00:00Z", event_kind: "masterclass" };

describe("event filters", () => {
  it("weekend and week windows use Aktau days", () => {
    expect(dateWindow("weekend", sat)).toEqual(["2026-11-07", "2026-11-08"]);
    expect(dateWindow("week", new Date("2026-11-04T12:00:00Z"))).toEqual(["2026-11-04", "2026-11-08"]);
  });
  it("multi-day event counts as today through its end date", () => {
    expect(matchesEventFilters(chess, { ...base, date: "today" }, new Date("2026-11-08T10:00:00Z"))).toBe(true);
    expect(matchesEventFilters(pizza, { ...base, date: "weekend" }, sat)).toBe(false);
  });
  it("age 0–5 matches 0–3 and 3–7 but not 7–12; unknown age is excluded", () => {
    expect(matchesEventFilters(chess, { ...base, age: "0-3" })).toBe(true);
    expect(matchesEventFilters(chess, { ...base, age: "3-7" })).toBe(true);
    expect(matchesEventFilters(chess, { ...base, age: "7-12" })).toBe(false);
    expect(matchesEventFilters(pizza, { ...base, age: "3-7" })).toBe(false);
  });
  it("free/paid and kind", () => {
    expect(matchesEventFilters({ ...pizza, is_free: true }, { ...base, price: "free" })).toBe(true);
    expect(matchesEventFilters({ ...pizza, price_from: 6500 }, { ...base, price: "paid" })).toBe(true);
    expect(matchesEventFilters(pizza, { ...base, price: "paid" })).toBe(false);
    expect(matchesEventFilters(chess, { ...base, kind: "masterclass" })).toBe(false);
    expect(matchesEventFilters({ city: "Актау", event_date: null }, { ...base, kind: "other" })).toBe(true);
  });
});
