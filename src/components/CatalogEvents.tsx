import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { upcomingCityEvents, formatEventDate } from "@/lib/events";
import { useLanguage } from "@/hooks/useLanguage";

type Item = { id: string; title: string; event_date: string | null; event_end_date: string | null; city: string; is_free: boolean | null };
export default function CatalogEvents({ city }: { city: string }) {
  const { lang, t } = useLanguage(); const [events, setEvents] = useState<Item[]>([]);
  useEffect(() => { let alive = true; supabase.from("announcements_public").select("id,title,event_date,event_end_date,city,is_free").eq("category", "event").eq("city", city).gt("expires_at", new Date().toISOString()).order("event_date").then(({data}) => { if (alive) setEvents(upcomingCityEvents((data || []) as Item[], city).slice(0, 3)); }); return () => { alive = false; }; }, [city]);
  if (!events.length) return null;
  return <section className="catalog-events"><div className="flex items-center justify-between mb-5"><h2 className="section-title">{lang === "ru" ? "Ближайшая афиша" : lang === "kz" ? "Алдағы афиша" : "Upcoming events"}</h2><Link to="/" className="flex items-center gap-2 text-sm font-semibold text-primary">{t("nav.events")}<ArrowRight size={16} /></Link></div><div className="space-y-3">{events.map(e => <Link key={e.id} to={`/publication/${e.id}`} className="event-row"><span className="event-date"><CalendarDays size={22} /><span>{formatEventDate(e.event_date, e.event_end_date, lang)}</span></span><h3 className="font-semibold text-sm flex-1">{e.title}</h3>{e.is_free && <span className="hidden sm:inline text-xs text-primary">{lang === "ru" ? "Бесплатно" : lang === "kz" ? "Тегін" : "Free"}</span>}<ArrowRight size={18} className="text-primary shrink-0" /></Link>)}</div></section>;
}