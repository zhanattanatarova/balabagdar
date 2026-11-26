import { aktauDate, eventInput } from "./events";

export interface CalendarEvent {
  id: string;
  title: string;
  body: string;
  city: string;
  event_date: string | null;
  event_end_date?: string | null;
  address?: string | null;
}

function nextDay(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

/** Only explicitly labelled event locations; never assume the linked club is the venue. */
export function calendarLocation(event: CalendarEvent): string {
  const labelled = event.body.match(/^(?:[📍\s]*)(?:место(?: проведения)?|адрес|мекенжай|өтетін орны|орны|location|venue|address)\s*:\s*(.+)$/im)?.[1]?.trim();
  const address = event.address?.trim() || labelled;
  if (!address) return "";
  return event.city && !address.toLocaleLowerCase().includes(event.city.toLocaleLowerCase())
    ? `${event.city}, ${address}` : address;
}

const compactDay = (day: string) => day.replace(/-/g, "");
const compactUtc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function calendarDates(event: CalendarEvent): { start: string; end?: string; allDay: boolean } | null {
  if (!event.event_date) return null;
  const input = eventInput(event.event_date);
  if (!input) return null;
  const day = aktauDate(event.event_date);
  const last = event.event_end_date && /^\d{4}-\d{2}-\d{2}$/.test(event.event_end_date) && event.event_end_date > day
    ? event.event_end_date : day;
  if (!input.includes("T")) {
    return { start: compactDay(day), end: compactDay(nextDay(last)), allDay: true };
  }
  // Use an explicit time range only on a date/time line, not a registration deadline.
  const range = event.body.match(/^(?:дата|время|күні|уақыт|date|time)\s*:[^\n]*?(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/im);
  const startTime = input.split("T")[1];
  const endTime = range?.[2]?.padStart(5, "0");
  const validEnd = endTime && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(endTime) && range?.[1]?.padStart(5, "0") === startTime && endTime > startTime;
  const end = validEnd ? compactUtc(`${last}T${endTime}:00+05:00`)
    : last > day ? compactUtc(`${nextDay(last)}T00:00:00+05:00`) : undefined;
  return { start: compactUtc(event.event_date), end, allDay: false };
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

// RFC 5545 folds at 75 UTF-8 octets, never in the middle of a Cyrillic character.
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let result = "", length = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (length + bytes > 75) { result += "\r\n "; length = 1; }
    result += char;
    length += bytes;
  }
  return result;
}

export function buildEventCalendar(event: CalendarEvent, url: string, now = new Date()): string | null {
  const dates = calendarDates(event);
  if (!dates) return null;
  const dateType = dates.allDay ? ";VALUE=DATE" : "";
  const location = calendarLocation(event);
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//BalaHub//Afisha//RU", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT", `UID:${escapeText(event.id)}@bala-hub.kz`, `DTSTAMP:${compactUtc(now.toISOString())}`,
    `DTSTART${dateType}:${dates.start}`,
    ...(dates.end ? [`DTEND${dateType}:${dates.end}`] : []),
    `SUMMARY:${escapeText(event.title)}`, `DESCRIPTION:${escapeText(`${event.body}\n\n${url}`)}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    `URL:${escapeText(url)}`, "END:VEVENT", "END:VCALENDAR", "",
  ].map(foldLine).join("\r\n");
}

export function googleCalendarUrl(event: CalendarEvent, url: string): string | null {
  const dates = calendarDates(event);
  if (!dates) return null;
  const params = new URLSearchParams({ action: "TEMPLATE", text: event.title,
    dates: `${dates.start}/${dates.end || dates.start}`, details: `${event.body}\n\n${url}`, ctz: "Asia/Aqtau" });
  const location = calendarLocation(event);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params}`;
}