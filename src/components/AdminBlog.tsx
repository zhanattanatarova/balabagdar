import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ArticleBody from "@/components/sections/ArticleBody";
import type { Article } from "@/pages/sections/BlogPage";

const blank = { id: "", slug: "", title: "", excerpt: "", body: "", cover_url: "", tags: "", published_at: "", is_published: false };
type Draft = typeof blank;

export default function AdminBlog() {
  const [rows, setRows] = useState<Article[] | null>(null);
  const [d, setD] = useState<Draft>(blank);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const load = () => (supabase as any).from("articles").select("*").order("created_at", { ascending: false }).then(({ data }: any) => setRows(data || []));
  useEffect(() => { load(); }, []);
  const f = (k: keyof Draft) => ({ value: String(d[k] ?? ""), onChange: (e: any) => setD({ ...d, [k]: e.target.value }) });

  const save = async () => {
    if (!/^[a-z0-9-]+$/.test(d.slug) || !d.title.trim()) { toast({ title: "Нужны slug (латиница, цифры, -) и заголовок", variant: "destructive" }); return; }
    const row = { slug: d.slug, title: d.title.trim(), excerpt: d.excerpt || null, body: d.body, cover_url: d.cover_url || null, tags: d.tags.split(",").map((t) => t.trim()).filter(Boolean), is_published: d.is_published, published_at: d.published_at ? new Date(d.published_at).toISOString() : d.is_published ? new Date().toISOString() : null };
    setSaving(true);
    const { error } = d.id ? await (supabase as any).from("articles").update(row).eq("id", d.id) : await (supabase as any).from("articles").insert(row);
    setSaving(false);
    if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Статья сохранена" }); setD(blank); load();
  };
  const del = async (id: string) => { if (!confirm("Удалить статью?")) return; await (supabase as any).from("articles").delete().eq("id", id); load(); };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-foreground rounded-3xl p-5 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
        <h2 className="text-lg font-black mb-1">Блог «Мама в городе»</h2>
        <p className="text-xs text-muted-foreground font-bold mb-3">Пока нет опубликованных статей, ссылка на блог на сайте скрыта.</p>
        {!rows ? <Loader2 className="animate-spin text-primary" /> : !rows.length ? <p className="text-sm">Статей пока нет.</p> : rows.map((a) => (
          <div key={a.id} className="flex items-center gap-2 p-2 rounded-xl bg-muted border border-border mb-2">
            <button className="flex-1 text-left text-sm font-bold" onClick={() => setD({ id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt || "", body: a.body, cover_url: a.cover_url || "", tags: (a.tags || []).join(", "), published_at: a.published_at ? a.published_at.slice(0, 16) : "", is_published: a.is_published })}>
              {a.title} <span className="text-xs text-muted-foreground">/{a.slug} · {a.is_published ? "опубликована" : "черновик"}</span>
            </button>
            <Button size="icon" variant="ghost" aria-label="Удалить" onClick={() => del(a.id)}><Trash2 size={14} /></Button>
          </div>
        ))}
      </div>
      <div className="bg-card border border-foreground rounded-3xl p-5 shadow-[6px_6px_0_0_hsl(var(--foreground))] space-y-3">
        <div className="flex items-center justify-between"><h3 className="font-black">{d.id ? "Редактировать статью" : "Новая статья"}</h3>
          <div className="flex gap-1"><Button size="sm" variant={preview ? "outline" : "default"} onClick={() => setPreview(false)}>Редактор</Button><Button size="sm" variant={preview ? "default" : "outline"} onClick={() => setPreview(true)}>Предпросмотр</Button></div>
        </div>
        {preview ? (
          <article className="border border-border rounded-2xl p-4">
            {d.cover_url && <img src={d.cover_url} alt="" className="w-full max-h-72 object-cover rounded-xl mb-3" />}
            <h1 className="text-2xl font-black">{d.title || "Заголовок"}</h1>
            {d.excerpt && <p className="text-muted-foreground font-bold mt-1">{d.excerpt}</p>}
            <ArticleBody body={d.body} />
          </article>
        ) : <>
          <div className="grid sm:grid-cols-2 gap-2"><div><Label>Slug*</Label><Input {...f("slug")} placeholder="kuda-poiti-v-aktau" /></div><div><Label>Заголовок*</Label><Input {...f("title")} /></div></div>
          <div><Label>Краткое описание (для SEO и карточки)</Label><Input maxLength={200} {...f("excerpt")} /></div>
          <div><Label>Обложка (ссылка на изображение)</Label><Input {...f("cover_url")} placeholder="https://..." /></div>
          <div><Label>Теги через запятую</Label><Input {...f("tags")} /></div>
          <div><Label>Текст (Markdown). Карточка клуба: [club:&lt;id клуба&gt;]</Label><Textarea rows={14} className="font-mono text-xs" {...f("body")} /></div>
          <div className="grid sm:grid-cols-2 gap-2 items-end">
            <div><Label>Дата публикации</Label><Input type="datetime-local" {...f("published_at")} /></div>
            <label className="flex items-center gap-2 text-sm font-bold pb-2"><input type="checkbox" checked={d.is_published} onChange={(e) => setD({ ...d, is_published: e.target.checked })} /> Опубликовать</label>
          </div>
        </>}
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving} className="flex-1">{saving && <Loader2 size={14} className="animate-spin" />}Сохранить</Button>
          {d.id && <Button variant="outline" onClick={() => setD(blank)}>Отмена</Button>}
        </div>
      </div>
    </div>
  );
}
