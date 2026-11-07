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

export function formatEventDate(start: string | null, end: string | null | undefined, lang: string): string {
  if (!start) return "";
  const day = aktauDate(start);
  if (!day) return "";
  const locale = lang === "kz" ? "kk-KZ" : lang === "en" ? "en-US" : "ru-RU";
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", timeZone: "UTC" };
  const first = new Date(`${day}T12:00:00Z`);
  let text = first.toLocaleDateString(locale, options);
  if (end && end > day) {
    const last = new Date(`${end}T12:00:00Z`);
    if (!Number.isNaN(last.getTime())) {
      text = day.slice(0, 7) === end.slice(0, 7)
        ? `${first.getUTCDate()}–${last.toLocaleDateString(locale, options)}`
        : `${text} – ${last.toLocaleDateString(locale, options)}`;
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
