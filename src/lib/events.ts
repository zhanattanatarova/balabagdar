export interface CityEvent {
  city: string;
  event_date: string | null;
  event_end_date?: string | null;
}

const OFFSET = 5 * 60 * 60 * 1000;
export function aktauDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() + OFFSET).toISOString().slice(0, 10);
}

export function eventInputToIso(value: string): string {
  return new Date(`${value.length === 10 ? value + "T00:00" : value}+05:00`).toISOString();
}

export function eventInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const input = new Date(date.getTime() + OFFSET).toISOString().slice(0, 16);
  return input.endsWith("T00:00") ? input.slice(0, 10) : input;
}

const MONTHS: Record<string, string[]> = {
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  kz: ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
export const monthName = (m: number, lang: string) => (MONTHS[lang] || MONTHS.ru)[m - 1];
/** "7 қараша" / "7 ноября" / "November 7" from a YYYY-MM-DD calendar day. */
export function formatDay(day: string, lang: string): string {
  const d = Number(day.slice(8, 10));
  const m = monthName(Number(day.slice(5, 7)), lang);
  return lang === "en" ? `${m} ${d}` : `${d} ${m}`;
}

export function formatEventDate(start: string | null, end: string | null | undefined, lang: string): string {
  if (!start) return "";
  const day = aktauDate(start);
  if (!day) return "";
  let text = formatDay(day, lang);
  if (end && end > day && /^\d{4}-\d{2}-\d{2}$/.test(end)) {
    const [d1, d2] = [Number(day.slice(8, 10)), Number(end.slice(8, 10))];
    if (day.slice(0, 7) === end.slice(0, 7)) {
      const m = monthName(Number(day.slice(5, 7)), lang);
      text = lang === "en" ? `${m} ${d1}–${d2}` : `${d1}–${d2} ${m}`;
    } else {
      text = `${text} – ${formatDay(end, lang)}`;
    }
  }
  const time = eventInput(start).split("T")[1];
  return time ? `${text}, ${time}` : text;
}

/** Keep an event through its final calendar day in Aktau (UTC+5). */
export function upcomingCityEvents<T extends CityEvent>(events: T[], city: string, now: Date = new Date()): T[] {
  return events.filter((e) => {
    if (city && e.city !== city) return false;
    if (!e.event_date) return false;
    const start = aktauDate(e.event_date);
    if (!start) return false;
    const last = e.event_end_date && e.event_end_date > start ? e.event_end_date : start;
    return last >= aktauDate(now.toISOString());
  });
}

export type DateFilter = "all" | "today" | "weekend" | "week";
export type AgeFilter = "0-3" | "3-7" | "7-12" | "12+";
export type PriceFilter = "free" | "paid";
export type EventKind = "masterclass" | "holiday" | "show" | "competition" | "exhibition" | "other";
export const EVENT_KINDS: EventKind[] = ["masterclass", "holiday", "show", "competition", "exhibition", "other"];
export const AGE_FILTERS: AgeFilter[] = ["0-3", "3-7", "7-12", "12+"];

export interface FilterableEvent extends CityEvent {
  age_min?: number | null;
  age_max?: number | null;
  is_free?: boolean | null;
  price_from?: number | null;
  event_kind?: string | null;
}
export interface EventFilters { date: DateFilter; age: AgeFilter | null; price: PriceFilter | null; kind: EventKind | null }

function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Date window [from, to] in Aktau calendar days for a date chip. */
export function dateWindow(filter: DateFilter, now: Date = new Date()): [string, string] | null {
  if (filter === "all") return null;
  const today = aktauDate(now.toISOString());
  if (filter === "today") return [today, today];
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  const sunday = addDays(today, dow === 0 ? 0 : 7 - dow);
  if (filter === "week") return [today, sunday];
  const saturday = addDays(sunday, -1);
  return [saturday < today ? today : saturday, sunday];
}

export function matchesEventFilters(e: FilterableEvent, f: EventFilters, now: Date = new Date()): boolean {
  const win = dateWindow(f.date, now);
  if (win) {
    if (!e.event_date) return false;
    const start = aktauDate(e.event_date);
    const last = e.event_end_date && e.event_end_date > start ? e.event_end_date : start;
    if (start > win[1] || last < win[0]) return false;
  }
  if (f.age) {
    if (e.age_min == null && e.age_max == null) return false;
    const [lo, hi] = { "0-3": [0, 3], "3-7": [3, 7], "7-12": [7, 12], "12+": [12, 99] }[f.age];
    const min = e.age_min ?? 0, max = e.age_max ?? 99;
    if (min >= hi || max < lo) return false;
  }
  if (f.price === "free" && e.is_free !== true) return false;
  if (f.price === "paid" && !(e.is_free === false || (e.price_from ?? 0) > 0)) return false;
  if (f.kind) {
    const kind = e.event_kind || "other";
    if (kind !== f.kind) return false;
  }
  return true;
}
