import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/sections/PageShell";
import SEO from "@/components/SEO";
import ArticleBody from "@/components/sections/ArticleBody";
import { useLanguage } from "@/hooks/useLanguage";

export interface Article { id: string; slug: string; title: string; excerpt: string | null; body: string; cover_url: string | null; tags: string[]; published_at: string | null; is_published: boolean; updated_at?: string }

const UI = {
  ru: { title: "Мама в городе", sub: "Блог BalaHub о детском досуге", empty: "Статей пока нет", missing: "Статья не найдена" },
  kz: { title: "Қаладағы ана", sub: "Балалар демалысы туралы BalaHub блогы", empty: "Әзірге мақалалар жоқ", missing: "Мақала табылмады" },
  en: { title: "Mom in the city", sub: "BalaHub blog about kids' activities", empty: "No articles yet", missing: "Article not found" },
};
const fmt = (d: string | null, lang: string) => d ? new Date(d).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Aqtau" }) : "";

export default function BlogPage() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const ui = UI[lang];
  const [rows, setRows] = useState<Article[] | null>(null);
  useEffect(() => {
    setRows(null);
    let q = (supabase as any).from("articles").select("*").eq("is_published", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false });
    if (slug) q = q.eq("slug", slug);
    q.then(({ data }: any) => setRows(data || []));
  }, [slug]);

  if (slug) {
    const a = rows?.[0];
    return (
      <PageShell title={a?.title || (rows ? ui.missing : "")} subtitle={a ? fmt(a.published_at, lang) : undefined} back="/blog">
        {!rows ? <Loader2 className="animate-spin text-primary" /> : a && (
          <article>
            <SEO title={`${a.title} | BalaHub`} description={(a.excerpt || a.body.replace(/[#*_\[\]()>]/g, "")).slice(0, 159)} path={`/blog/${a.slug}`} type="article" image={a.cover_url || undefined}
              jsonLd={{ "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.excerpt || undefined, datePublished: a.published_at, dateModified: a.updated_at || a.published_at, image: a.cover_url || undefined, author: { "@type": "Organization", name: "BalaHub" }, publisher: { "@type": "Organization", name: "BalaHub" }, mainEntityOfPage: `https://bala-hub.kz/blog/${a.slug}`, keywords: a.tags?.join(", ") }} />
            {a.cover_url && <img src={a.cover_url} alt={a.title} className="w-full max-h-96 object-cover rounded-2xl mb-4" />}
            {a.tags?.length > 0 && <div className="flex flex-wrap gap-1.5 mb-2">{a.tags.map((t) => <span key={t} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted">#{t}</span>)}</div>}
            <ArticleBody body={a.body} />
          </article>
        )}
      </PageShell>
    );
  }
  return (
    <PageShell title={ui.title} subtitle={ui.sub}>
      <SEO title={`${ui.title} — блог BalaHub`} description={ui.sub} path="/blog" />
      {!rows ? <Loader2 className="animate-spin text-primary" /> : !rows.length ? <p className="font-bold">{ui.empty}</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {rows.map((a) => (
            <Link key={a.id} to={`/blog/${a.slug}`} className="cartoon-card overflow-hidden hover:bg-muted/40">
              {a.cover_url && <img src={a.cover_url} alt={a.title} className="w-full h-40 object-cover" />}
              <div className="p-4"><div className="text-xs font-bold text-muted-foreground">{fmt(a.published_at, lang)}</div><h2 className="font-black mt-1">{a.title}</h2>{a.excerpt && <p className="text-sm mt-1 line-clamp-3">{a.excerpt}</p>}</div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
