import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import PageShell from "@/components/sections/PageShell";
import SEO from "@/components/SEO";
import { ClubMiniCard, PubCard } from "@/components/sections/Cards";
import { useLanguage } from "@/hooks/useLanguage";
import { useCityData } from "@/hooks/useCityData";
import { holidayItems, SEASONS, type Season } from "@/lib/collections";

export const SEASON_LABELS: Record<Season, Record<"ru" | "kz" | "en", string>> = {
  winter: { ru: "Зимние", kz: "Қысқы", en: "Winter" },
  spring: { ru: "Весенние", kz: "Көктемгі", en: "Spring" },
  summer: { ru: "Летние", kz: "Жазғы", en: "Summer" },
};
const UI = {
  ru: { title: "Каникулы и лагеря", sub: "Лагеря и программы на каникулы", empty: "Программы на каникулы скоро появятся", add: "Добавить программу", camps: "Лагеря", programs: "Программы" },
  kz: { title: "Демалыс және лагерьлер", sub: "Демалысқа арналған лагерьлер мен бағдарламалар", empty: "Демалыс бағдарламалары жақында пайда болады", add: "Бағдарлама қосу", camps: "Лагерьлер", programs: "Бағдарламалар" },
  en: { title: "Holidays & camps", sub: "Camps and holiday programs", empty: "Holiday programs are coming soon", add: "Add a program", camps: "Camps", programs: "Programs" },
};

function defaultSeason(): Season {
  const m = new Date().getUTCMonth();
  return m >= 2 && m <= 3 ? "spring" : m >= 4 && m <= 7 ? "summer" : "winter";
}

export default function HolidaysPage() {
  const { lang } = useLanguage();
  const ui = UI[lang];
  const [season, setSeason] = useState<Season>(defaultSeason);
  const { loading, city, clubs, pubs } = useCityData();
  const items = holidayItems(clubs, pubs, season);
  return (
    <PageShell title={ui.title} subtitle={`${ui.sub} · ${city}`}>
      <SEO title={`${ui.title} — ${city} | BalaHub`} description={`${ui.sub}: ${city}.`} path="/holidays" />
      <div className="flex gap-2 mb-4" role="tablist">
        {SEASONS.map((s) => (
          <button key={s} role="tab" aria-selected={season === s} onClick={() => setSeason(s)}
            className={`px-4 py-2 rounded-full text-xs font-black border-2 ${season === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>{SEASON_LABELS[s][lang]}</button>
        ))}
      </div>
      {loading ? <Loader2 className="animate-spin text-primary" /> : items.clubs.length + items.pubs.length === 0 ? (
        <div className="cartoon-card p-8 text-center">
          <div className="text-4xl mb-2">🏕️</div>
          <p className="font-black">{ui.empty}</p>
          <Link to="/dashboard" className="inline-block mt-4 bg-primary text-primary-foreground font-black text-sm px-6 py-3 rounded-full">{ui.add}</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {items.pubs.length > 0 && <section><h2 className="font-black mb-2">{ui.programs}</h2><div className="grid sm:grid-cols-2 gap-3">{items.pubs.map((p) => <PubCard key={p.id} pub={p} />)}</div></section>}
          {items.clubs.length > 0 && <section><h2 className="font-black mb-2">{ui.camps}</h2><div className="grid sm:grid-cols-2 gap-3">{items.clubs.map((c) => <ClubMiniCard key={c.id} club={c} />)}</div></section>}
        </div>
      )}
    </PageShell>
  );
}
