import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

type S = { views: number; whatsapp: number };

const load = async (clubId: string, from: Date, to: Date): Promise<S> => {
  const { data } = await supabase.rpc("club_event_stats", { _from: from.toISOString(), _to: to.toISOString() });
  const r: any = (data || []).find((x: any) => x.club_id === clubId);
  return { views: Number(r?.views || 0), whatsapp: Number(r?.whatsapp || 0) };
};

const PartnerStats = ({ clubId }: { clubId: string }) => {
  const { lang } = useLanguage();
  const [cur, setCur] = useState<S | null>(null);
  const [prev, setPrev] = useState<S | null>(null);

  useEffect(() => {
    const n = new Date();
    const m0 = new Date(n.getFullYear(), n.getMonth(), 1);
    const m1 = new Date(n.getFullYear(), n.getMonth() + 1, 1);
    const mp = new Date(n.getFullYear(), n.getMonth() - 1, 1);
    load(clubId, m0, m1).then(setCur);
    load(clubId, mp, m0).then(setPrev);
  }, [clubId]);

  const text = (s: S, current: boolean) => {
    if (lang === "kz") return `${current ? "Осы айда" : "Өткен айда"} сіздің бетіңізді ${s.views} рет қарады, WhatsApp-та ${s.whatsapp} рет жазды.`;
    if (lang === "en") return `${current ? "This month" : "Last month"} your page was viewed ${s.views} times, you got ${s.whatsapp} WhatsApp messages.`;
    return `${current ? "В этом месяце" : "В прошлом месяце"} вашу страницу посмотрели ${s.views} раз, вам написали в WhatsApp ${s.whatsapp} раз.`;
  };

  return (
    <div className="px-4 mt-4 space-y-2">
      {cur && <div className="cartoon-card p-3 text-sm font-bold">📊 {text(cur, true)}</div>}
      {prev && <div className="cartoon-card p-3 text-sm text-muted-foreground font-bold">{text(prev, false)}</div>}
    </div>
  );
};

export default PartnerStats;
