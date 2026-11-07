import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Collection } from "@/lib/publicData";

const RULES = [
  ["weekend_events", "События ближайших выходных"],
  ["free", "Бесплатные события и пробные"],
  ["age", "По возрасту"],
  ["season", "Каникулы (сезон)"],
  ["manual", "Ручной список"],
] as const;

type Draft = Omit<Collection, "id" | "rule_json" | "club_ids" | "event_ids"> & { id?: string; rule: string; min: string; max: string; season: string; club_ids: string; event_ids: string };
const blank = (): Draft => ({ slug: "", title_ru: "", title_kz: "", title_en: "", description_ru: "", description_kz: "", description_en: "", cover_emoji: "✨", sort: 0, is_active: true, rule: "manual", min: "", max: "", season: "winter", club_ids: "", event_ids: "" });

function toDraft(c: Collection): Draft {
  const r: any = c.rule_json || { type: "manual" };
  return { ...c, rule: r.type, min: String(r.min ?? ""), max: String(r.max ?? ""), season: r.season || "winter", club_ids: (c.club_ids || []).join("\n"), event_ids: (c.event_ids || []).join("\n") };
}

export default function AdminCollections() {
  const [rows, setRows] = useState<Collection[] | null>(null);
  const [d, setD] = useState<Draft>(blank());
  const [saving, setSaving] = useState(false);
  const load = () => (supabase as any).from("collections").select("*").order("sort").then(({ data }: any) => setRows(data || []));
  useEffect(() => { load(); }, []);
  const ids = (s: string) => s.split(/[\s,]+/).map((x) => x.trim()).filter((x) => /^[0-9a-f-]{36}$/i.test(x));

  const save = async () => {
    if (!d.slug.match(/^[a-z0-9-]+$/) || !d.title_ru.trim()) { toast({ title: "Нужны slug (латиница, цифры, -) и название", variant: "destructive" }); return; }
    const rule = d.rule === "age" ? { type: "age", min: Number(d.min || 0), max: Number(d.max || 18) } : d.rule === "season" ? { type: "season", season: d.season } : { type: d.rule };
    const row = { slug: d.slug, title_ru: d.title_ru, title_kz: d.title_kz || null, title_en: d.title_en || null, description_ru: d.description_ru || null, description_kz: d.description_kz || null, description_en: d.description_en || null, cover_emoji: d.cover_emoji || null, sort: Number(d.sort) || 0, is_active: d.is_active, rule_json: rule, club_ids: ids(d.club_ids), event_ids: ids(d.event_ids) };
    setSaving(true);
    const { error } = d.id ? await (supabase as any).from("collections").update(row).eq("id", d.id) : await (supabase as any).from("collections").insert(row);
    setSaving(false);
    if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Подборка сохранена" }); setD(blank()); load();
  };
  const del = async (id: string) => { if (!confirm("Удалить подборку?")) return; await (supabase as any).from("collections").delete().eq("id", id); load(); };
  const f = (k: keyof Draft) => ({ value: String(d[k] ?? ""), onChange: (e: any) => setD({ ...d, [k]: e.target.value }) });

  return (
    <div className="space-y-4">
      <div className="bg-card border-[3px] border-foreground rounded-3xl p-5 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
        <h2 className="text-lg font-black mb-3">Подборки</h2>
        {!rows ? <Loader2 className="animate-spin text-primary" /> : rows.map((c) => (
          <div key={c.id} className="flex items-center gap-2 p-2 rounded-xl bg-muted border-2 border-border mb-2">
            <span className="text-xl">{c.cover_emoji}</span>
            <button className="flex-1 text-left text-sm font-bold" onClick={() => setD(toDraft(c))}>{c.title_ru} <span className="text-xs text-muted-foreground">/{c.slug} · {(c.rule_json as any)?.type} {c.is_active ? "" : "· скрыта"}</span></button>
            <Button size="icon" variant="ghost" aria-label="Удалить" onClick={() => del(c.id)}><Trash2 size={14} /></Button>
          </div>
        ))}
      </div>
      <div className="bg-card border-[3px] border-foreground rounded-3xl p-5 shadow-[6px_6px_0_0_hsl(var(--foreground))] space-y-3">
        <h3 className="font-black">{d.id ? "Редактировать подборку" : "Новая подборка"}</h3>
        <div className="grid grid-cols-[1fr_80px_80px] gap-2">
          <div><Label>Slug*</Label><Input {...f("slug")} placeholder="weekend" /></div>
          <div><Label>Эмодзи</Label><Input {...f("cover_emoji")} /></div>
          <div><Label>Порядок</Label><Input type="number" {...f("sort")} /></div>
        </div>
        <div><Label>Название (RU)*</Label><Input {...f("title_ru")} /></div>
        <div className="grid sm:grid-cols-2 gap-2"><div><Label>Название (KZ)</Label><Input {...f("title_kz")} /></div><div><Label>Название (EN)</Label><Input {...f("title_en")} /></div></div>
        <div><Label>Описание (RU)</Label><Input {...f("description_ru")} /></div>
        <div className="grid sm:grid-cols-2 gap-2"><div><Label>Описание (KZ)</Label><Input {...f("description_kz")} /></div><div><Label>Описание (EN)</Label><Input {...f("description_en")} /></div></div>
        <div><Label>Правило</Label>
          <select {...f("rule")} className="mt-1 w-full px-3 py-2 rounded-xl bg-muted border-2 border-border text-sm font-bold">{RULES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </div>
        {d.rule === "age" && <div className="grid grid-cols-2 gap-2"><div><Label>Возраст от</Label><Input type="number" {...f("min")} /></div><div><Label>Возраст до</Label><Input type="number" {...f("max")} /></div></div>}
        {d.rule === "season" && <select {...f("season")} className="w-full px-3 py-2 rounded-xl bg-muted border-2 border-border text-sm font-bold"><option value="winter">Зимние</option><option value="spring">Весенние</option><option value="summer">Летние</option></select>}
        {d.rule === "manual" && <>
          <div><Label>ID клубов (по одному в строке)</Label><Textarea rows={3} {...f("club_ids")} /></div>
          <div><Label>ID публикаций (по одному в строке)</Label><Textarea rows={3} {...f("event_ids")} /></div>
        </>}
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={d.is_active} onChange={(e) => setD({ ...d, is_active: e.target.checked })} /> Показывать на сайте</label>
        <p className="text-xs text-muted-foreground font-bold">Пустая подборка на сайте не показывается.</p>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving} className="flex-1">{saving && <Loader2 size={14} className="animate-spin" />}Сохранить</Button>
          {d.id && <Button variant="outline" onClick={() => setD(blank())}>Отмена</Button>}
        </div>
      </div>
    </div>
  );
}
