import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import PageShell from "@/components/sections/PageShell";
import SEO from "@/components/SEO";
import { ClubMiniCard, PubCard } from "@/components/sections/Cards";
import { useLanguage } from "@/hooks/useLanguage";
import { useCityData, resolvedCollections } from "@/hooks/useCityData";
import { pick } from "@/lib/publicData";

const UI = {
  ru: { title: "Подборки", sub: "Готовые идеи, куда пойти с ребёнком", empty: "Подборок пока нет", missing: "Подборка пока пуста", clubs: "Кружки и центры", events: "События и предложения" },
  kz: { title: "Топтамалар", sub: "Баламен қайда бару керек — дайын идеялар", empty: "Әзірге топтамалар жоқ", missing: "Топтама әзірге бос", clubs: "Үйірмелер мен орталықтар", events: "Оқиғалар мен ұсыныстар" },
  en: { title: "Collections", sub: "Ready-made ideas for where to go with kids", empty: "No collections yet", missing: "This collection is empty for now", clubs: "Clubs and centers", events: "Events and offers" },
};

export default function CollectionsPage() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const ui = UI[lang];
  const { loading, city, clubs, pubs, collections } = useCityData(true);
  const list = resolvedCollections(collections, clubs, pubs);
  if (!slug) return (
    <PageShell title={ui.title} subtitle={`${ui.sub} · ${city}`}>
      <SEO title={`${ui.title} — ${city} | BalaHub`} description={`${ui.sub}: ${city}.`} path="/collections" />
      {loading ? <Loader2 className="animate-spin text-primary" /> : !list.length ? <p className="font-bold">{ui.empty}</p> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map(({ c, clubs, pubs }) => (
            <Link key={c.id} to={`/collections/${c.slug}`} className="cartoon-card p-4 flex gap-3 items-center hover:bg-muted/40">
              <span className="text-4xl">{c.cover_emoji || "✨"}</span>
              <span><span className="block font-black">{pick(c, "title", lang)}</span><span className="text-xs font-bold text-muted-foreground">{pick(c, "description", lang)} · {clubs.length + pubs.length}</span></span>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
  const item = list.find((r) => r.c.slug === slug);
  const raw = collections.find((c) => c.slug === slug);
  const title = raw ? pick(raw, "title", lang) : ui.title;
  return (
    <PageShell title={`${raw?.cover_emoji || ""} ${title}`.trim()} subtitle={raw ? pick(raw, "description", lang) : undefined} back="/collections">
      <SEO title={`${title} — ${city} | BalaHub`} description={(raw ? pick(raw, "description", lang) : title) + ` · ${city}`} path={`/collections/${slug}`} />
      {loading ? <Loader2 className="animate-spin text-primary" /> : !item ? <p className="font-bold">{ui.missing}</p> : (
        <div className="space-y-6">
          {item.pubs.length > 0 && <section><h2 className="font-black mb-2">{ui.events}</h2><div className="grid sm:grid-cols-2 gap-3">{item.pubs.map((p) => <PubCard key={p.id} pub={p} />)}</div></section>}
          {item.clubs.length > 0 && <section><h2 className="font-black mb-2">{ui.clubs}</h2><div className="grid sm:grid-cols-2 gap-3">{item.clubs.map((c) => <ClubMiniCard key={c.id} club={c} />)}</div></section>}
        </div>
      )}
    </PageShell>
  );
}
