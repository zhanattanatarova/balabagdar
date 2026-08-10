import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin, Search, Star, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeImageUrl } from "@/lib/safeUrl";
import { useLanguage } from "@/hooks/useLanguage";
import { TAXONOMY, idsForGroup } from "@/lib/categoriesTaxonomy";
import BottomNav from "@/components/BottomNav";
import SEO from "@/components/SEO";

type AgeKey = "all" | "0-3" | "3-7" | "7-12" | "12+";

const SearchPage = () => {
  const navigate = useNavigate();
  const { t, tField } = useLanguage();
  const [params, setParams] = useSearchParams();

  const cat = params.get("cat") || "";
  const sub = params.get("sub") || "";
  const q = params.get("q") || "";
  const city = params.get("city") || "Актау";
  const age = (params.get("age") as AgeKey) || "all";

  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => setSearchInput(q), [q]);

  const group = useMemo(() => TAXONOMY.find((g) => g.id === cat), [cat]);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      let query = supabase
        .from("clubs")
        .select("*")
        .eq("city", city)
        .eq("is_active", true);

      if (cat) {
        if (sub) {
          query = query.contains("categories", [`${cat}.${sub}`]);
        } else {
          const ids = idsForGroup(cat);
          query = query.or(
            `categories.ov.{${ids.join(",")}},category.eq.${cat}`,
          );
        }
      }

      if (q.trim()) {
        const sq = `%${q.trim()}%`;
        query = query.or(
          [
            `name_ru.ilike.${sq}`,
            `name_kz.ilike.${sq}`,
            `name_en.ilike.${sq}`,
            `address.ilike.${sq}`,
            `description_ru.ilike.${sq}`,
            `description_kz.ilike.${sq}`,
            `description_en.ilike.${sq}`,
          ].join(","),
        );
      }

      if (age !== "all") {
        const ranges: Record<string, [number, number]> = {
          "0-3": [0, 3], "3-7": [3, 7], "7-12": [7, 12], "12+": [12, 99],
        };
        const [lo, hi] = ranges[age];
        query = query.lte("age_min", hi).gte("age_max", lo);
      }

      const { data } = await query.order("rating", { ascending: false }).limit(100);
      if (!cancelled) {
        setClubs(data || []);
        setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [cat, sub, q, city, age]);

  const catLabel = cat ? t(`cat.${cat}` as any) : "";
  const subLabel = cat && sub ? t(`${cat}.${sub}` as any) : "";
  const searchTitle = subLabel || catLabel || q || (city ? city : "Все кружки");


  const ageOptions: { id: AgeKey; label: string }[] = [
    { id: "all", label: t("age.any") },
    { id: "0-3", label: t("age.0_3") },
    { id: "3-7", label: t("age.3_7") },
    { id: "7-12", label: t("age.7_12") },
    { id: "12+", label: t("age.12_plus") },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 max-w-6xl mx-auto">
      <SEO
        title={`${searchTitle} — поиск кружков | BalaBagdar`.slice(0, 60)}
        description={`Подборка детских кружков, секций и центров${city ? ` в городе ${city}` : ""}${q ? ` по запросу «${q}»` : ""} с фильтрами по возрасту, цене и направлению.`.slice(0, 159)}
        path={`/search${params.toString() ? `?${params.toString()}` : ""}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${searchTitle} — BalaBagdar`,
          description: `Детские кружки и центры${city ? ` в городе ${city}` : ""}`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: (clubs || []).slice(0, 20).map((c: any, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              name: tField(c, "name"),
              url: `https://balabagdar.kz/club/${c.id}`,
            })),
          },
        }}
      />
      {/* Header */}
      <div
        className="px-4 pt-4 pb-4 border-b-[3px]"
        style={{ background: "var(--gradient-header)", borderColor: "hsl(145, 90%, 30% / 0.5)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30"
            aria-label="Назад"
          >
            <ArrowLeft size={18} className="text-primary-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-primary-foreground/80 font-bold flex items-center gap-1">
              <MapPin size={11} /> {city}
            </p>
            <h1 className="text-base font-black text-primary-foreground truncate">
              {catLabel || t("home.popular")}
              {subLabel && <span className="opacity-90"> · {subLabel}</span>}
            </h1>
          </div>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: "hsl(145, 70%, 35%)" }} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") update({ q: searchInput }); }}
            onBlur={() => update({ q: searchInput })}
            placeholder={t("home.search")}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-[3px] focus:ring-secondary border-[3px]"
            style={{ background: "white", color: "hsl(145, 70%, 30%)", borderColor: "hsl(145, 50%, 75%)" }}
          />
        </div>
      </div>

      {/* Active filter chips */}
      <div className="px-4 pt-3 pb-2 sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-muted-foreground">🔎 Фильтр:</span>
          {cat && (
            <button
              onClick={() => update({ cat: null, sub: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-primary text-primary-foreground border-2 border-primary"
            >
              {group?.emoji} {catLabel}
              <X size={12} />
            </button>
          )}
          {sub && (
            <button
              onClick={() => update({ sub: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-secondary text-secondary-foreground border-2 border-secondary"
            >
              {subLabel}
              <X size={12} />
            </button>
          )}
          {q && (
            <button
              onClick={() => { setSearchInput(""); update({ q: null }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-card border-2 border-border"
            >
              «{q}»
              <X size={12} />
            </button>
          )}
          {age !== "all" && (
            <button
              onClick={() => update({ age: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-card border-2 border-border"
            >
              👶 {ageOptions.find((a) => a.id === age)?.label}
              <X size={12} />
            </button>
          )}
          {!cat && !sub && !q && age === "all" && (
            <span className="text-xs font-bold text-muted-foreground">все кружки в городе</span>
          )}
        </div>

        {/* Age row */}
        <div className="mt-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {ageOptions.map((opt) => {
            const active = age === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => update({ age: opt.id === "all" ? null : opt.id })}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black border-2 transition-colors ${active ? "bg-primary/15 text-primary border-primary" : "bg-muted text-muted-foreground border-transparent"}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Sub chips if a group is selected */}
        {group && group.subs.length > 0 && (
          <div className="mt-2 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => update({ sub: null })}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black border-2 ${!sub ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}
            >
              Все {catLabel.toLowerCase()}
            </button>
            {group.subs.map((s) => {
              const active = sub === s;
              return (
                <button
                  key={s}
                  onClick={() => update({ sub: s })}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black border-2 transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}
                >
                  {t(`${cat}.${s}` as any)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 pt-4">
        <p className="text-xs font-bold text-muted-foreground mb-2">
          Найдено: {loading ? "…" : clubs.length}
        </p>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>
        ) : clubs.length === 0 ? (
          <div className="cartoon-card text-center py-14 px-6">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="font-black text-lg">{t("home.not_found")}</h3>
            <p className="text-sm text-muted-foreground font-bold mt-1">
              Попробуйте убрать часть фильтров или сменить город
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {clubs.map((club, i) => {
              const name = tField(club.name_ru, club.name_kz, club.name_en);
              return (
                <div
                  key={club.id}
                  onClick={() => navigate(`/club/${club.id}`)}
                  className="cartoon-card overflow-hidden cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 0.04}s`, animationFillMode: "both" }}
                >
                  <div className="relative h-28">
                    {safeImageUrl(club.avatar_url) ? (
                      <img src={safeImageUrl(club.avatar_url)} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center"><span className="text-3xl">🏫</span></div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-black text-xs leading-snug line-clamp-1">{name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} className="text-secondary fill-secondary" />
                      <span className="text-xs font-black">{club.rating || "—"}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">{club.reviews_count} {t("club.reviews")}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-bold">
                      <MapPin size={10} className="text-primary" />{club.address || club.city}
                    </p>
                    {club.price_from != null && (
                      <p className="text-[10px] font-bold text-primary mt-1">
                        {t("club.price")} {club.price_from?.toLocaleString()} {club.price_currency}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default SearchPage;
