import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Row { id: string; title: string; body: string; city: string; category: string; is_approved: boolean; is_promoted: boolean; deal_until: string | null; discount_text: string | null; name: string; expires_at: string }

export default function AdminDeals() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const load = () => (supabase as any).from("announcements").select("id,title,body,city,category,is_approved,is_promoted,deal_until,discount_text,name,expires_at").in("category", ["promo", "trial"]).order("created_at", { ascending: false }).then(({ data }: any) => setRows(data || []));
  useEffect(() => { load(); }, []);
  const upd = async (id: string, patch: Partial<Row>) => {
    const { error } = await (supabase as any).from("announcements").update(patch).eq("id", id);
    if (error) toast({ title: "Ошибка", description: error.message, variant: "destructive" }); else load();
  };
  const pending = rows?.filter((r) => !r.is_approved) || [];
  const live = rows?.filter((r) => r.is_approved) || [];
  const Item = ({ r }: { r: Row }) => (
    <div className="p-3 rounded-xl bg-muted border-2 border-border">
      <div className="text-xs font-black text-primary">{r.category === "promo" ? "Акция" : "Пробное занятие"} · {r.city}{r.deal_until ? ` · до ${r.deal_until}` : ""}{r.discount_text ? ` · ${r.discount_text}` : ""}</div>
      <div className="font-bold text-sm">{r.title}</div>
      <p className="text-xs mt-1 line-clamp-3">{r.body}</p>
      <div className="text-xs text-muted-foreground mt-1">{r.name}</div>
      <div className="flex flex-wrap gap-2 mt-2">
        {r.is_approved
          ? <Button size="sm" variant="outline" onClick={() => upd(r.id, { is_approved: false })}>Снять с публикации</Button>
          : <Button size="sm" onClick={() => upd(r.id, { is_approved: true })}>Одобрить</Button>}
        <Button size="sm" variant={r.is_promoted ? "default" : "outline"} onClick={() => upd(r.id, { is_promoted: !r.is_promoted })}>{r.is_promoted ? "★ Реклама (вкл.)" : "Сделать рекламой"}</Button>
      </div>
    </div>
  );
  return (
    <div className="bg-card border-[3px] border-foreground rounded-3xl p-5 shadow-[6px_6px_0_0_hsl(var(--foreground))] space-y-4">
      <h2 className="text-lg font-black">Акции и пробные занятия</h2>
      {!rows ? <Loader2 className="animate-spin text-primary" /> : <>
        <section><h3 className="font-black text-sm mb-2">На модерации ({pending.length})</h3><div className="space-y-2">{pending.length ? pending.map((r) => <Item key={r.id} r={r} />) : <p className="text-sm">Нет заявок.</p>}</div></section>
        <section><h3 className="font-black text-sm mb-2">Опубликованы ({live.length})</h3><div className="space-y-2">{live.map((r) => <Item key={r.id} r={r} />)}</div></section>
      </>}
    </div>
  );
}
