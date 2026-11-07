import { describe, expect, it } from "vitest";
import { resolveCollection, holidayItems, dealActive } from "./collections";

const now = new Date("2026-11-07T07:00:00Z"); // Saturday in Aktau
const clubs = [
  { id: "default", age_min: 3, age_max: 18 },
  { id: "empty", age_min: null, age_max: null },
  { id: "toddler", age_min: 2, age_max: 4 },
  { id: "teen", age_min: 10, age_max: 16 },
  { id: "camp", categories: ["camp"], age_min: null, age_max: null },
];
const pubs = [
  { id: "sat", category: "event", city: "Актау", event_date: "2026-11-07T08:00:00Z", is_free: true, age_min: 0, age_max: 5 },
  { id: "next", category: "event", city: "Актау", event_date: "2026-11-12T19:00:00Z" },
  { id: "trial", category: "trial", city: "Актау", event_date: null, is_free: true },
  { id: "promo", category: "promo", city: "Актау", event_date: null },
  { id: "winter", category: "other", city: "Актау", event_date: null, season: "winter" },
];

describe("collections", () => {
  it("3–5 excludes clubs with empty or default 3–18 age", () => {
    const r = resolveCollection({ rule_json: { type: "age", min: 3, max: 5 } }, clubs, pubs, now);
    expect(r.clubs.map((c) => c.id)).toEqual(["toddler"]);
    expect(r.pubs.map((p) => p.id)).toEqual(["sat"]);
  });
  it("weekend = events of the coming weekend only", () => {
    expect(resolveCollection({ rule_json: { type: "weekend_events" } }, clubs, pubs, now).pubs.map((p) => p.id)).toEqual(["sat"]);
  });
  it("free = free events + free trials", () => {
    expect(resolveCollection({ rule_json: { type: "free" } }, clubs, pubs, now).pubs.map((p) => p.id)).toEqual(["sat", "trial"]);
  });
  it("winter holidays = camp clubs + winter publications", () => {
    const r = holidayItems(clubs, pubs, "winter", now);
    expect(r.clubs.map((c) => c.id)).toEqual(["camp"]);
    expect(r.pubs.map((p) => p.id)).toEqual(["winter"]);
    expect(holidayItems(clubs, pubs, "summer", now).pubs).toHaveLength(0);
  });
  it("deal expires after its last Aktau day", () => {
    expect(dealActive({ deal_until: "2026-11-07" }, new Date("2026-11-07T18:59:00Z"))).toBe(true);
    expect(dealActive({ deal_until: "2026-11-07" }, new Date("2026-11-07T19:00:00Z"))).toBe(false);
  });
});
