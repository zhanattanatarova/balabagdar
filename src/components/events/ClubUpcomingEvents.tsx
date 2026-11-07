import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { formatEventDate, upcomingCityEvents } from "@/lib/events";

interface Item { id: string; title: string; city: string; event_date: string | null; event_end_date: string | null }

export default function ClubUpcomingEvents({ clubId }: { clubId: string }) {
  const { lang } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    supabase.from("announcements_public" as any).select("id,title,city,event_date,event_end_date")
      .eq("club_id", clubId).eq("category", "event").order("event_date", { ascending: true })
      .then(({ data }) => setItems(upcomingCityEvents(((data as unknown) as Item[]) || [], "")));
  }, [clubId]);
  if (!items.length) return null;
  const title = { ru: "Ближайшие события центра", kz: "Орталықтың жақын оқиғалары", en: "Upcoming events" }[lang];
  return (
    <div className="px-4 mt-4">
      <h2 className="font-black text-sm mb-2">{title}</h2>
      <div className="space-y-2">
        {items.map((e) => (
          <Link key={e.id} to={`/publication/${e.id}`} className="cartoon-card p-3 block hover:bg-muted/50">
            <div className="flex items-center gap-1.5 text-xs font-black text-primary"><Calendar size={13} /> {formatEventDate(e.event_date, e.event_end_date, lang)}</div>
            <div className="font-black text-sm mt-1">{e.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
