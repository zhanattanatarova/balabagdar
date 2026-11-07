import { useState } from "react";
import { Loader2 } from "lucide-react";
import PageShell from "@/components/sections/PageShell";
import SEO from "@/components/SEO";
import { PubCard } from "@/components/sections/Cards";
import { useLanguage } from "@/hooks/useLanguage";
import { useCityData } from "@/hooks/useCityData";
import { dealActive } from "@/lib/collections";

const UI = {
  ru: { title: "Акции и пробные занятия", sub: "Скидки и бесплатные пробные занятия", all: "Все", promo: "Акции", trial: "Пробные занятия", empty: "Пока нет акций" },
  kz: { title: "Акциялар және сынақ сабақтары", sub: "Жеңілдіктер мен тегін сынақ сабақтары", all: "Барлығы", promo: "Акциялар", trial: "Сынақ сабақтары", empty: "Әзірге акциялар жоқ" },
  en: { title: "Deals & trial classes", sub: "Discounts and free trial classes", all: "All", promo: "Deals", trial: "Trial classes", empty: "No deals yet" },
};

export default function DealsPage() {
  const { lang } = useLanguage();
  const ui = UI[lang];
  const [type, setType] = useState<"all" | "promo" | "trial">("all");
  const { loading, city, pubs } = useCityData();
  const deals = pubs
    .filter((p) => (p.category === "promo" || p.category === "trial") && dealActive(p) && (type === "all" || p.category === type))
    .sort((a, b) => Number(b.is_promoted) - Number(a.is_promoted) || b.created_at.localeCompare(a.created_at));
  return (
    <PageShell title={ui.title} subtitle={`${ui.sub} · ${city}`}>
      <SEO title={`${ui.title} — ${city} | BalaHub`} description={`${ui.sub}: ${city}.`} path="/deals" />
      <div className="flex gap-2 mb-4">
        {(["all", "promo", "trial"] as const).map((k) => (
          <button key={k} onClick={() => setType(k)} aria-pressed={type === k} className={`px-4 py-2 rounded-full text-xs font-black border-2 ${type === k ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>{ui[k]}</button>
        ))}
      </div>
      {loading ? <Loader2 className="animate-spin text-primary" /> : !deals.length ? <p className="font-bold">{ui.empty}</p> : (
        <div className="grid sm:grid-cols-2 gap-3">{deals.map((p) => <PubCard key={p.id} pub={p} />)}</div>
      )}
    </PageShell>
  );
}
