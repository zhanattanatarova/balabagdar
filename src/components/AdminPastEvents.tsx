import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { aktauDate, formatEventDate } from "@/lib/events";

interface Row { id: string; title: string; city: string; event_date: string | null; event_end_date: string | null }

export default function AdminPastEvents() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    supabase.from("announcements").select("id,title,city,event_date,event_end_date").eq("category", "event")
      .order("event_date", { ascending: false }).then(({ data }) => {
        const today = aktauDate(new Date().toISOString());
        setRows(((data as Row[]) || []).filter((e) => {
          if (!e.event_date) return false;
          const start = aktauDate(e.event_date);
          const last = e.event_end_date && e.event_end_date > start ? e.event_end_date : start;
          return last < today;
        }));
      });
  }, []);
  return (
    <div className="bg-card border-[3px] border-foreground rounded-3xl p-5 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
      <h2 className="text-lg font-black mb-1">Прошедшие события</h2>
      <p className="text-xs text-muted-foreground font-bold mb-3">Скрыты из афиши автоматически после окончания дня события (время Актау).</p>
      {!rows ? <Loader2 className="animate-spin text-primary" /> : rows.length === 0 ? <p className="text-sm">Нет прошедших событий.</p> : (
        <div className="space-y-2">
          {rows.map((e) => (
            <Link key={e.id} to={`/publication/${e.id}`} className="block p-3 rounded-xl bg-muted border-2 border-border">
              <div className="text-xs font-black text-primary">{formatEventDate(e.event_date, e.event_end_date, "ru")} · {e.city}</div>
              <div className="font-bold text-sm">{e.title}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
