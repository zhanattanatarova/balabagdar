import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type Row = { club_id: string; name: string; views: number; whatsapp: number; calls: number; instagram: number };
type Key = "name" | "views" | "whatsapp" | "calls" | "instagram";

const AdminClubStats = ({ clubs }: { clubs: { id: string; name_ru: string }[] }) => {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [stats, setStats] = useState<Record<string, Omit<Row, "club_id" | "name">>>({});
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<{ key: Key; asc: boolean }>({ key: "views", asc: false });

  useEffect(() => {
    const [y, m] = month.split("-").map(Number);
    const from = new Date(y, m - 1, 1).toISOString();
    const to = new Date(y, m, 1).toISOString();
    setLoading(true);
    supabase.rpc("club_event_stats", { _from: from, _to: to }).then(({ data }) => {
      const map: typeof stats = {};
      (data || []).forEach((r: any) => {
        map[r.club_id] = { views: Number(r.views), whatsapp: Number(r.whatsapp), calls: Number(r.calls), instagram: Number(r.instagram) };
      });
      setStats(map);
      setLoading(false);
    });
  }, [month]);

  const rows = useMemo(() => {
    const list: Row[] = clubs.map((c) => ({
      club_id: c.id,
      name: c.name_ru || "—",
      ...(stats[c.id] || { views: 0, whatsapp: 0, calls: 0, instagram: 0 }),
    }));
    return list.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string, "ru") : (av as number) - (bv as number);
      return sort.asc ? cmp : -cmp;
    });
  }, [clubs, stats, sort]);

  const cols: [Key, string][] = [["name", "Клуб"], ["views", "Просмотры"], ["whatsapp", "WhatsApp"], ["calls", "Звонки"], ["instagram", "Instagram"]];

  return (
    <div className="cartoon-card p-4">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-lg font-black">📊 Статистика</h2>
        <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)}
          className="border-2 border-border rounded-xl px-3 py-2 text-sm font-bold bg-card" />
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                {cols.map(([k, label]) => (
                  <th key={k} className={`py-2 px-2 font-black cursor-pointer select-none ${k === "name" ? "text-left" : "text-right"}`}
                    onClick={() => setSort((s) => ({ key: k, asc: s.key === k ? !s.asc : k === "name" }))}>
                    {label}{sort.key === k ? (sort.asc ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.club_id} className="border-b border-border">
                  <td className="py-2 px-2 font-bold">{r.name}</td>
                  <td className="py-2 px-2 text-right">{r.views}</td>
                  <td className="py-2 px-2 text-right">{r.whatsapp}</td>
                  <td className="py-2 px-2 text-right">{r.calls}</td>
                  <td className="py-2 px-2 text-right">{r.instagram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminClubStats;
