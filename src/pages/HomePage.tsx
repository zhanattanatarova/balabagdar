import { useState, useMemo, useEffect } from "react";
import { Search, MapPin, ChevronDown, Star, ArrowRight, X, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/balahub-logo.png";
import iconCreativity from "@/assets/icon-creativity.png";
import iconSport from "@/assets/icon-sport.png";
import iconDevelopment from "@/assets/icon-development.png";
import iconSpeech from "@/assets/icon-speech.png";
import iconDance from "@/assets/icon-dance.png";
import iconRobotics from "@/assets/icon-robotics.png";
import iconSwim from "@/assets/icon-swim.png";
import iconMusic from "@/assets/icon-music.png";
import iconHealth from "@/assets/icon-health.png";
import iconTutors from "@/assets/icon-tutors.png";
import AuthModal from "@/components/AuthModal";

const cities = [
  "Алматы", "Астана", "Шымкент", "Караганда", "Актобе",
  "Тараз", "Павлодар", "Усть-Каменогорск", "Семей", "Атырау",
  "Костанай", "Кызылорда", "Уральск", "Петропавловск", "Актау",
  "Темиртау", "Туркестан", "Кокшетау", "Талдыкорган", "Экибастуз",
  "Рудный", "Жезказган", "Каскелен", "Талгар", "Конаев",
  "Жанаозен", "Байконур", "Балхаш", "Кентау", "Сатпаев",
  "Сарань", "Щучинск", "Риддер", "Аксай", "Степногорск",
];

const categoryIcons: Record<string, string> = {
  creativity: iconCreativity, sport: iconSport, development: iconDevelopment,
  speech: iconSpeech, dance: iconDance, robotics: iconRobotics,
  swim: iconSwim, music: iconMusic, health: iconHealth, tutors: iconTutors,
};

const categoryIds = ["creativity", "sport", "development", "speech", "dance", "robotics", "swim", "music", "health", "tutors"];

const HomePage = () => {
  const { user } = useAuth();
  const { t, tField } = useLanguage();
  const navigate = useNavigate();
  const [city, setCity] = useState("Астана");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoadingClubs(true);
      const { data } = await supabase
        .from("clubs")
        .select("*")
        .eq("city", city)
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(20);
      setClubs(data || []);
      setLoadingClubs(false);
    };
    fetchClubs();
  }, [city]);

  const filteredCities = cities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()));

  const filteredClubs = useMemo(() => {
    let result = clubs;
    if (selectedCategory) {
      result = result.filter((c) => c.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      result = result.filter((c) =>
        c.name_ru?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name_kz?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [searchQuery, clubs, selectedCategory]);

  return (
    <div className="pb-24 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto bg-background min-h-screen">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {/* City Picker */}
      {showCityPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowCityPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">🏙️ {t("home.select_city")}</h3>
              <button onClick={() => setShowCityPicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input value={citySearch} onChange={(e) => setCitySearch(e.target.value)} placeholder={t("common.search_city")}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-[3px] focus:ring-primary border-2 border-border" autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              {filteredCities.map((c) => (
                <button key={c} onClick={() => { setCity(c); setShowCityPicker(false); setCitySearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${c === city ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}>
                  <MapPin size={16} className={c === city ? "text-primary" : "text-muted-foreground"} />
                  <span className={`text-sm ${c === city ? "font-black text-foreground" : "font-bold"}`}>{c}</span>
                  {c === city && <Check size={16} className="text-primary ml-auto" />}
                </button>
              ))}
              {filteredCities.length === 0 && <p className="text-center text-muted-foreground text-sm py-8 font-bold">😕 {t("home.not_found")}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mx-4 mt-3 px-4 pt-4 pb-4 rounded-3xl border-[3px]"
        style={{ background: "var(--gradient-header)", boxShadow: "var(--shadow-cartoon-lg)", borderColor: "hsl(145, 90%, 30% / 0.5)" }}>
        <div className="flex items-center justify-center mb-3">
          <button onClick={() => setShowCityPicker(true)}
            className="flex items-center gap-1.5 font-black text-lg px-4 py-2 rounded-full border-[3px]"
            style={{ background: "hsl(145, 85%, 38%)", color: "white", borderColor: "hsl(145, 90%, 28% / 0.5)" }}>
            <img src={logo} alt="" className="w-7 h-7" />{city}<ChevronDown size={18} className="text-primary-foreground" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "hsl(145, 70%, 35%)" }} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("home.search")}
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-bold focus:outline-none focus:ring-[3px] focus:ring-secondary border-[3px]"
            style={{ background: "white", color: "hsl(145, 70%, 30%)", boxShadow: "var(--shadow-cartoon)", borderColor: "hsl(145, 50%, 75%)" }} />
        </div>
      </div>

      {/* Free banner */}
      <div className="mx-4 mt-4 p-4 rounded-2xl bg-secondary/10 border-2 border-secondary/30">
        <h3 className="font-black text-sm">{t("home.free_banner_title")}</h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t("home.free_banner_text")}</p>
      </div>

      {/* Categories */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-4">
          {categoryIds.map((id) => (
            <button key={id} className="cat-card" onClick={() => setSearchQuery("")}>
              <div className="cat-card-img">
                <img src={categoryIcons[id]} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-foreground leading-tight">{t(`cat.${id}` as any)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clubs */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="section-title">{t("home.popular")}</h2>
          <button className="text-primary text-sm font-black">{t("home.all")}</button>
        </div>

        {loadingClubs ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
        ) : filteredClubs.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm text-muted-foreground font-bold">{t("home.not_found")}</p>
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
            {filteredClubs.map((club, i) => {
              const name = tField(club.name_ru, club.name_kz, club.name_en);
              return (
                <div key={club.id} onClick={() => navigate(`/club/${club.id}`)}
                  className="min-w-[160px] md:min-w-0 cartoon-card overflow-hidden shrink-0 md:shrink cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                  <div className="relative h-24">
                    {club.avatar_url ? (
                      <img src={club.avatar_url} alt={name} className="w-full h-full object-cover" />
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
                    <p className="text-[10px] font-bold text-primary mt-1">
                      {t("club.price")} {club.price_from?.toLocaleString()} {club.price_currency}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nearby */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">{t("home.nearby")}</h2>
          <button className="text-primary text-sm font-black">{t("home.all")}</button>
        </div>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClubs.slice(0, 3).map((club, i) => {
            const name = tField(club.name_ru, club.name_kz, club.name_en);
            return (
              <div key={`nearby-${club.id}`} onClick={() => navigate(`/club/${club.id}`)}
                className="flex gap-3 cartoon-card p-3 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2" style={{ borderColor: "hsl(var(--foreground) / 0.06)" }}>
                  {club.avatar_url ? (
                    <img src={club.avatar_url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center"><span className="text-xl">🏫</span></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="font-black text-sm truncate">{name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 font-bold"><MapPin size={10} className="text-primary" />{club.address || club.city}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-secondary fill-secondary" />
                      <span className="text-xs font-black">{club.rating || "—"}</span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{club.reviews_count} {t("club.reviews")}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-primary shrink-0 mt-5" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
