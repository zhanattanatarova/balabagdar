import { hasRealAge } from "./clubDisplay";
import { aktauDate, matchesEventFilters, upcomingCityEvents, type FilterableEvent } from "./events";

export type Season = "winter" | "spring" | "summer";
export const SEASONS: Season[] = ["winter", "spring", "summer"];
export type CollectionRule =
  | { type: "weekend_events" }
  | { type: "free" }
  | { type: "age"; min: number; max: number }
  | { type: "season"; season: Season }
  | { type: "manual" };

export interface RuleClub { id: string; categories?: string[] | null; category?: string | null; age_min?: number | null; age_max?: number | null }
export interface RulePub extends FilterableEvent { id: string; category: string; season?: string | null; deal_until?: string | null }
export interface CollectionDef { rule_json?: CollectionRule | null; club_ids?: string[] | null; event_ids?: string[] | null }

export const isCamp = (c: RuleClub) => c.category === "camp" || (c.categories || []).includes("camp");

/** A deal/trial is valid until the end of its deal_until day in Aktau. */
export function dealActive(p: { deal_until?: string | null }, now: Date = new Date()): boolean {
  return !p.deal_until || p.deal_until >= aktauDate(now.toISOString());
}

/** Holiday page items: camp clubs + publications tagged with the season (events only while upcoming). */
export function holidayItems<C extends RuleClub, P extends RulePub>(clubs: C[], pubs: P[], season: Season, now: Date = new Date()) {
  const seasonal = pubs.filter((p) => p.season === season && (p.category !== "event" || upcomingCityEvents([p], "", now).length > 0));
  return { clubs: clubs.filter(isCamp), pubs: seasonal };
}

export function resolveCollection<C extends RuleClub, P extends RulePub>(def: CollectionDef, clubs: C[], pubs: P[], now: Date = new Date()): { clubs: C[]; pubs: P[] } {
  const rule = def.rule_json;
  const events = upcomingCityEvents(pubs.filter((p) => p.category === "event"), "", now);
  const empty = { date: "all" as const, age: null, price: null, kind: null };
  if (!rule || rule.type === "manual") {
    const ci = new Set(def.club_ids || []), ei = new Set(def.event_ids || []);
    return { clubs: clubs.filter((c) => ci.has(c.id)), pubs: pubs.filter((p) => ei.has(p.id)) };
  }
  switch (rule.type) {
    case "weekend_events":
      return { clubs: [], pubs: events.filter((e) => matchesEventFilters(e, { ...empty, date: "weekend" }, now)) };
    case "free":
      return { clubs: [], pubs: [
        ...events.filter((e) => e.is_free === true),
        ...pubs.filter((p) => p.category === "trial" && p.is_free === true && dealActive(p, now)),
      ] };
    case "age": {
      const overlaps = (lo?: number | null, hi?: number | null) => (lo ?? 0) <= rule.max && (hi ?? 99) >= rule.min;
      return {
        clubs: clubs.filter((c) => hasRealAge(c.age_min, c.age_max) && overlaps(c.age_min, c.age_max)),
        pubs: events.filter((e) => (e.age_min != null || e.age_max != null) && overlaps(e.age_min, e.age_max)),
      };
    }
    case "season":
      return holidayItems(clubs, pubs, rule.season, now);
  }
}
