export interface CityEvent {
  city: string;
  event_date: string | null;
}

/** Upcoming = in the selected city and the event date has not passed yet. */
export function upcomingCityEvents<T extends CityEvent>(events: T[], city: string, now: Date = new Date()): T[] {
  return events.filter((e) => {
    if (city && e.city !== city) return false;
    if (!e.event_date) return false;
    const d = new Date(e.event_date);
    return !Number.isNaN(d.getTime()) && d.getTime() >= now.getTime();
  });
}
