import { describe, expect, it } from "vitest";
import { buildEventCalendar, calendarDates, calendarLocation, googleCalendarUrl, type CalendarEvent } from "./eventCalendar";

const event: CalendarEvent = { id: "real-event", title: "Новогодний гном", city: "Актау",
  event_date: "2026-12-19T07:00:00Z", body: "Дата: 19 декабря 2026, 12:00–13:30 (UTC+5).\nМесто: Актау, 3 мкр, 15 дом." };
const url = "https://bala-hub.kz/publication/real-event";

describe("event calendar exports", () => {
  it("preserves the supplied date and 12:00–13:30 Aktau time range", () => {
    expect(calendarDates(event)).toEqual({ start: "20261219T070000Z", end: "20261219T083000Z", allDay: false });
  });
  it("includes the supplied address in both calendar formats", () => {
    expect(calendarLocation(event)).toBe("Актау, 3 мкр, 15 дом.");
    expect(buildEventCalendar(event, url)).toContain("LOCATION:Актау\\, 3 мкр\\, 15 дом.");
    expect(new URL(googleCalendarUrl(event, url) || "").searchParams.get("location")).toBe("Актау, 3 мкр, 15 дом.");
  });
  it("uses an all-day event rather than inventing midnight for an unspecified time", () => {
    const result = buildEventCalendar({ ...event, event_date: "2026-12-02T19:00:00Z", body: "С 3 декабря" }, url);
    expect(result).toContain("DTSTART;VALUE=DATE:20261203\r\nDTEND;VALUE=DATE:20261204");
    expect(result).not.toContain("T000000");
  });
  it("preserves the full inclusive December 18–30 date range", () => {
    expect(calendarDates({ ...event, event_date: "2026-12-17T19:00:00Z", event_end_date: "2026-12-30" }))
      .toEqual({ start: "20261218", end: "20261231", allDay: true });
  });
  it("does not invent an address or finishing time when neither is specified", () => {
    const result = buildEventCalendar({ ...event, body: "Время окончания и адрес уточняются" }, url);
    expect(result).not.toContain("LOCATION:");
    expect(result).not.toContain("DTEND");
    expect(result).toContain("DTSTART:20261219T070000Z");
  });
  it("does not export an event without a valid date", () => {
    expect(buildEventCalendar({ ...event, event_date: null }, url)).toBeNull();
    expect(googleCalendarUrl({ ...event, event_date: "bad-date" }, url)).toBeNull();
  });
  it("escapes newlines and folds long Cyrillic text without breaking UTF-8", () => {
    const result = buildEventCalendar({ ...event, title: "Детский праздник; ".repeat(20), body: "Строка 1\nСтрока 2" }, url) || "";
    expect(result).toContain("DESCRIPTION:Строка 1\\nСтрока 2");
    expect(result).not.toContain("�");
    for (const line of result.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});