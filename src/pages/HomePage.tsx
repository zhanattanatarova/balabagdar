import { useState, useMemo, useEffect } from "react";
import { Search, MapPin, ChevronDown, Star, ArrowRight, X, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeImageUrl } from "@/lib/safeUrl";
import { translations } from "@/i18n/translations";
import BrandLogo from "@/components/BrandLogo";
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
import iconLanguages from "@/assets/icon-languages.png";
import iconShops from "@/assets/icon-shops.png";
import iconSpecial from "@/assets/icon-special.png";
import iconKindergarten from "@/assets/icon-kindergarten.png";
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
  languages: iconLanguages, shops: iconShops, special: iconSpecial,
  mini_garden: iconKindergarten, garden: iconKindergarten, school: iconKindergarten,
  correction: iconSpecial, neuropsychology: iconDevelopment,
  it: iconRobotics, camp: iconSport, scouts: iconSport,
};

const categoryIds = ["creativity", "sport", "development", "special", "mini_garden", "garden", "school", "correction", "neuropsychology", "speech", "dance", "robotics", "swim", "music", "health", "tutors", "languages", "it", "camp", "scouts", "shops"];


const languageOptions = [
  { id: "english", emoji: "🇬🇧" },
  { id: "chinese", emoji: "🇨🇳" },
  { id: "french", emoji: "🇫🇷" },
  { id: "korean", emoji: "🇰🇷" },
  { id: "turkish", emoji: "🇹🇷" },
  { id: "kazakh", emoji: "🇰🇿" },
  { id: "russian", emoji: "🇷🇺" },
  { id: "german", emoji: "🇩🇪" },
  { id: "spanish", emoji: "🇪🇸" },
  { id: "arabic", emoji: "🇸🇦" },
  { id: "japanese", emoji: "🇯🇵" },
  { id: "italian", emoji: "🇮🇹" },
];

const danceOptions = [
  { id: "ballet", emoji: "🩰" },
  { id: "ballroom", emoji: "💃" },
  { id: "sport", emoji: "🏆" },
  { id: "modern", emoji: "✨" },
  { id: "hiphop", emoji: "🎤" },
  { id: "folk", emoji: "🪘" },
  { id: "latin", emoji: "🌶️" },
  { id: "breakdance", emoji: "🕺" },
  { id: "contemporary", emoji: "🎭" },
  { id: "oriental", emoji: "🪷" },
];

const healthOptions = [
  { id: "massage", emoji: "💆" },
  { id: "pediatrician", emoji: "👶" },
  { id: "nutritionist", emoji: "🥗" },
  { id: "psychologist", emoji: "🧠" },
  { id: "neurologist", emoji: "🧬" },
  { id: "dentist", emoji: "🦷" },
  { id: "ophthalmologist", emoji: "👁️" },
  { id: "orthopedist", emoji: "🦴" },
  { id: "speech_therapist", emoji: "🗣️" },
  { id: "defectologist", emoji: "📚" },
  { id: "lfk", emoji: "🤸" },
  { id: "osteopath", emoji: "🤲" },
  { id: "allergist", emoji: "🤧" },
  { id: "ent", emoji: "👂" },
  { id: "vaccination", emoji: "💉" },
];

const sportOptions = [
  { id: "gymnastics", emoji: "🤸" },
  { id: "karate", emoji: "🥋" },
  { id: "judo", emoji: "🥋" },
  { id: "taekwondo", emoji: "🦵" },
  { id: "boxing", emoji: "🥊" },
  { id: "wrestling", emoji: "🤼" },
  { id: "football", emoji: "⚽" },
  { id: "basketball", emoji: "🏀" },
  { id: "volleyball", emoji: "🏐" },
  { id: "tennis", emoji: "🎾" },
  { id: "hockey", emoji: "🏒" },
  { id: "chess", emoji: "♟️" },
  { id: "skating", emoji: "⛸️" },
  { id: "cycling", emoji: "🚴" },
  { id: "athletics", emoji: "🏃" },
];

const tutorsOptions = [
  { id: "school_prep", emoji: "🎒" },
  { id: "primary", emoji: "📓" },
  { id: "kazakh", emoji: "🇰🇿" },
  { id: "russian", emoji: "🇷🇺" },
  { id: "english", emoji: "🇬🇧" },
  { id: "math", emoji: "➗" },
  { id: "algebra", emoji: "🧮" },
  { id: "geometry", emoji: "📐" },
  { id: "physics", emoji: "⚛️" },
  { id: "chemistry", emoji: "🧪" },
  { id: "biology", emoji: "🧬" },
  { id: "geography", emoji: "🌍" },
  { id: "history", emoji: "📜" },
  { id: "literature", emoji: "📖" },
  { id: "informatics", emoji: "💻" },
  { id: "ent", emoji: "🎯" },
  { id: "nish", emoji: "🏅" },
  { id: "ktl", emoji: "🎖️" },
  { id: "fizmat", emoji: "🧠" },
  { id: "olympiad", emoji: "🏆" },
];

const creativityOptions = [
  { id: "drawing", emoji: "✏️" },
  { id: "painting", emoji: "🎨" },
  { id: "handicraft", emoji: "🧵" },
  { id: "sculpting", emoji: "🗿" },
  { id: "pottery", emoji: "🏺" },
  { id: "origami", emoji: "📄" },
  { id: "embroidery", emoji: "🪡" },
  { id: "knitting", emoji: "🧶" },
  { id: "sewing", emoji: "👗" },
  { id: "theater", emoji: "🎭" },
  { id: "cinema", emoji: "🎬" },
  { id: "photography", emoji: "📷" },
  { id: "design", emoji: "🖌️" },
  { id: "calligraphy", emoji: "🖋️" },
  { id: "cooking", emoji: "👨‍🍳" },
];

const musicOptions = [
  { id: "dombyra", emoji: "🪕" },
  { id: "kobyz", emoji: "🎻" },
  { id: "vocals", emoji: "🎤" },
  { id: "piano", emoji: "🎹" },
  { id: "guitar", emoji: "🎸" },
  { id: "violin", emoji: "🎻" },
  { id: "drums", emoji: "🥁" },
  { id: "flute", emoji: "🪈" },
  { id: "saxophone", emoji: "🎷" },
  { id: "accordion", emoji: "🪗" },
  { id: "cello", emoji: "🎻" },
  { id: "solfeggio", emoji: "🎼" },
  { id: "theory", emoji: "📝" },
  { id: "dj", emoji: "🎧" },
  { id: "choir", emoji: "👥" },
];

const specialOptions = [
  { id: "afk", emoji: "🤸" },
  { id: "lfk", emoji: "🧘" },
  { id: "aba", emoji: "🧩" },
  { id: "sensory", emoji: "✋" },
  { id: "speech", emoji: "🗣️" },
  { id: "psychologist", emoji: "🧠" },
  { id: "neurologist", emoji: "🧬" },
  { id: "massage", emoji: "💆" },
  { id: "osteopath", emoji: "🤲" },
  { id: "swim", emoji: "🏊" },
  { id: "hippotherapy", emoji: "🐴" },
  { id: "canistherapy", emoji: "🐶" },
  { id: "art", emoji: "🎨" },
  { id: "music", emoji: "🎵" },
  { id: "montessori", emoji: "🧸" },
  { id: "inclusive", emoji: "💖" },
];

const developmentOptions = [
  { id: "early", emoji: "👶" },
  { id: "special", emoji: "💖" },
  { id: "afk", emoji: "🤸" },
  { id: "aba", emoji: "🧩" },
  { id: "sensory", emoji: "✋" },
  { id: "montessori", emoji: "🧸" },
  { id: "logic", emoji: "🧠" },
  { id: "memory", emoji: "💡" },
  { id: "mental_arithmetic", emoji: "🔢" },
  { id: "reading", emoji: "📚" },
  { id: "emotional", emoji: "❤️" },
  { id: "social", emoji: "🤝" },
  { id: "fine_motor", emoji: "✌️" },
];

interface HomePageProps {
  city: string;
  setCity: (city: string) => void;
}

const HomePage = ({ city, setCity }: HomePageProps) => {
  const { user } = useAuth();
  const { t, tField } = useLanguage();
  const navigate = useNavigate();
  const goSearch = (cat: string, sub?: string | null) => {
    const sp = new URLSearchParams();
    sp.set("cat", cat);
    if (sub) sp.set("sub", sub);
    if (city) sp.set("city", city);
    if (ageFilter !== "all") sp.set("age", ageFilter);
    if (searchQuery.trim()) sp.set("q", searchQuery.trim());
    navigate(`/search?${sp.toString()}`);
  };
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [selectedDance, setSelectedDance] = useState<string | null>(null);
  const [showDancePicker, setShowDancePicker] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [selectedHealth, setSelectedHealth] = useState<string | null>(null);
  const [showHealthPicker, setShowHealthPicker] = useState(false);
  const [selectedTutors, setSelectedTutors] = useState<string | null>(null);
  const [showTutorsPicker, setShowTutorsPicker] = useState(false);
  const [selectedCreativity, setSelectedCreativity] = useState<string | null>(null);
  const [showCreativityPicker, setShowCreativityPicker] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [selectedDevelopment, setSelectedDevelopment] = useState<string | null>(null);
  const [showDevelopmentPicker, setShowDevelopmentPicker] = useState(false);
  const [selectedSpecial, setSelectedSpecial] = useState<string | null>(null);
  const [showSpecialPicker, setShowSpecialPicker] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [ageFilter, setAgeFilter] = useState<"all" | "0-3" | "3-7" | "7-12" | "12+">("all");

  // Map a search query to matching club category ids by scanning translations.
  const matchedCategoryIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [] as string[];
    const ids = new Set<string>();
    for (const [key, val] of Object.entries(translations)) {
      const v = val as Record<string, string>;
      const hit = (v.ru || "").toLowerCase().includes(q)
        || (v.kz || "").toLowerCase().includes(q)
        || (v.en || "").toLowerCase().includes(q);
      if (!hit) continue;
      if (key.startsWith("cat.")) {
        ids.add(key.slice(4));
      } else if (key.includes(".") && !key.endsWith(".title") && !key.endsWith(".all")) {
        // e.g. "sport.gymnastics" — stored as namespaced id on clubs
        const [group] = key.split(".");
        const known = ["sport","dance","languages","tutors","creativity","music","development","special","health"];
        if (known.includes(group)) ids.add(key);
      }
    }
    return Array.from(ids);
  }, [searchQuery]);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoadingClubs(true);
      let query = supabase
        .from("clubs")
        .select("*")
        .eq("city", city)
        .eq("is_active", true);

      // Build the list of namespaced category ids to match on the `categories` array.
      const subMap: Record<string, string | null> = {
        languages: selectedLanguage,
        dance: selectedDance,
        sport: selectedSport,
        health: selectedHealth,
        tutors: selectedTutors,
        creativity: selectedCreativity,
        music: selectedMusic,
        development: selectedDevelopment,
        special: selectedSpecial,
      };

      if (selectedCategory) {
        const sub = subMap[selectedCategory];
        if (sub) {
          // Specific subcategory selected — exact namespaced id.
          const id = `${selectedCategory}.${sub}`;
          query = query.contains("categories", [id]);
        } else {
          // Whole group — match top-level id, any of its subs, OR legacy `category` column.
          const ids = [selectedCategory];
          const groupSubs: Record<string, string[]> = {
            languages: languageOptions.map((o) => o.id),
            dance: danceOptions.map((o) => o.id),
            sport: sportOptions.map((o) => o.id),
            health: healthOptions.map((o) => o.id),
            tutors: tutorsOptions.map((o) => o.id),
            creativity: creativityOptions.map((o) => o.id),
            music: musicOptions.map((o) => o.id),
            development: developmentOptions.map((o) => o.id),
            special: specialOptions.map((o) => o.id),
          };
          for (const s of groupSubs[selectedCategory] ?? []) ids.push(`${selectedCategory}.${s}`);
          // overlaps: clubs whose categories array shares any id with `ids`
          query = query.or(
            `categories.ov.{${ids.join(",")}},category.eq.${selectedCategory}`,
          );
        }
      }

      if (searchQuery.trim()) {
        const raw = searchQuery.trim();
        const sq = `%${raw}%`;
        const orParts = [
          `name_ru.ilike.${sq}`,
          `name_kz.ilike.${sq}`,
          `name_en.ilike.${sq}`,
          `address.ilike.${sq}`,
          `description_ru.ilike.${sq}`,
          `description_kz.ilike.${sq}`,
          `description_en.ilike.${sq}`,
        ];
        if (matchedCategoryIds.length > 0) {
          orParts.push(`categories.ov.{${matchedCategoryIds.join(",")}}`);
          // also match legacy `category` text column on top-level group ids
          const topIds = matchedCategoryIds.filter((id) => !id.includes("."));
          for (const id of topIds) orParts.push(`category.eq.${id}`);
        }
        query = query.or(orParts.join(","));
      }

      if (ageFilter !== "all") {
        const ranges: Record<string, [number, number]> = {
          "0-3": [0, 3], "3-7": [3, 7], "7-12": [7, 12], "12+": [12, 99],
        };
        const [lo, hi] = ranges[ageFilter];
        // club overlaps requested range: age_min <= hi AND age_max >= lo
        query = query.lte("age_min", hi).gte("age_max", lo);
      }

      const { data } = await query
        .order("rating", { ascending: false })
        .limit(50);
      setClubs(data || []);
      setLoadingClubs(false);
    };

    const debounce = setTimeout(fetchClubs, searchQuery ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [city, selectedCategory, selectedLanguage, selectedDance, selectedSport, selectedHealth, selectedTutors, selectedCreativity, selectedMusic, selectedDevelopment, selectedSpecial, searchQuery, ageFilter, matchedCategoryIds]);

  const filteredCities = cities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()));

  return (
    <div className="pb-24 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto bg-background min-h-screen">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {/* Language Picker */}
      {showLanguagePicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowLanguagePicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">🌍 {t("lang.title")}</h3>
              <button onClick={() => setShowLanguagePicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowLanguagePicker(false); goSearch("languages"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedLanguage ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
              >
                <span className="text-xl">🌐</span>
                <span className={`text-sm ${!selectedLanguage ? "font-black text-foreground" : "font-bold"}`}>{t("lang.all")}</span>
                {!selectedLanguage && <Check size={16} className="text-primary ml-auto" />}
              </button>
              {languageOptions.map((lang) => {
                const isActive = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => { setShowLanguagePicker(false); goSearch("languages", lang.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
                  >
                    <span className="text-xl">{lang.emoji}</span>
                    <span className={`text-sm ${isActive ? "font-black text-foreground" : "font-bold"}`}>{t(`lang.${lang.id}` as any)}</span>
                    {isActive && <Check size={16} className="text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dance Picker */}
      {showDancePicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowDancePicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">💃 {t("dance.title")}</h3>
              <button onClick={() => setShowDancePicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowDancePicker(false); goSearch("dance"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedDance ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
              >
                <span className="text-xl">💫</span>
                <span className={`text-sm ${!selectedDance ? "font-black text-foreground" : "font-bold"}`}>{t("dance.all")}</span>
                {!selectedDance && <Check size={16} className="text-primary ml-auto" />}
              </button>
              {danceOptions.map((d) => {
                const isActive = selectedDance === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => { setShowDancePicker(false); goSearch("dance", d.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
                  >
                    <span className="text-xl">{d.emoji}</span>
                    <span className={`text-sm ${isActive ? "font-black text-foreground" : "font-bold"}`}>{t(`dance.${d.id}` as any)}</span>
                    {isActive && <Check size={16} className="text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sport Picker */}
      {showSportPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowSportPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">⚽ {t("sport.title")}</h3>
              <button onClick={() => setShowSportPicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowSportPicker(false); goSearch("sport"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedSport ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
              >
                <span className="text-xl">🏅</span>
                <span className={`text-sm ${!selectedSport ? "font-black text-foreground" : "font-bold"}`}>{t("sport.all")}</span>
                {!selectedSport && <Check size={16} className="text-primary ml-auto" />}
              </button>
              {sportOptions.map((s) => {
                const isActive = selectedSport === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setShowSportPicker(false); goSearch("sport", s.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className={`text-sm ${isActive ? "font-black text-foreground" : "font-bold"}`}>{t(`sport.${s.id}` as any)}</span>
                    {isActive && <Check size={16} className="text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Health Picker */}
      {showHealthPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowHealthPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">🩺 {t("health.title")}</h3>
              <button onClick={() => setShowHealthPicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowHealthPicker(false); goSearch("health"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedHealth ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
              >
                <span className="text-xl">❤️</span>
                <span className={`text-sm ${!selectedHealth ? "font-black text-foreground" : "font-bold"}`}>{t("health.all")}</span>
                {!selectedHealth && <Check size={16} className="text-primary ml-auto" />}
              </button>
              {healthOptions.map((h) => {
                const isActive = selectedHealth === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => { setShowHealthPicker(false); goSearch("health", h.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
                  >
                    <span className="text-xl">{h.emoji}</span>
                    <span className={`text-sm ${isActive ? "font-black text-foreground" : "font-bold"}`}>{t(`health.${h.id}` as any)}</span>
                    {isActive && <Check size={16} className="text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tutors Picker */}
      {showTutorsPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowTutorsPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">📚 {t("tutors.title")}</h3>
              <button onClick={() => setShowTutorsPicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowTutorsPicker(false); goSearch("tutors"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedTutors ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
              >
                <span className="text-xl">📖</span>
                <span className={`text-sm ${!selectedTutors ? "font-black text-foreground" : "font-bold"}`}>{t("tutors.all")}</span>
                {!selectedTutors && <Check size={16} className="text-primary ml-auto" />}
              </button>
              {tutorsOptions.map((o) => {
                const isActive = selectedTutors === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => { setShowTutorsPicker(false); goSearch("tutors", o.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <span className={`text-sm ${isActive ? "font-black text-foreground" : "font-bold"}`}>{t(`tutors.${o.id}` as any)}</span>
                    {isActive && <Check size={16} className="text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Creativity Picker */}
      {showCreativityPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowCreativityPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">🎨 {t("creativity.title")}</h3>
              <button onClick={() => setShowCreativityPicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowCreativityPicker(false); goSearch("creativity"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedCreativity ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
              >
                <span className="text-xl">🎭</span>
                <span className={`text-sm ${!selectedCreativity ? "font-black text-foreground" : "font-bold"}`}>{t("creativity.all")}</span>
                {!selectedCreativity && <Check size={16} className="text-primary ml-auto" />}
              </button>
              {creativityOptions.map((o) => {
                const isActive = selectedCreativity === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => { setShowCreativityPicker(false); goSearch("creativity", o.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <span className={`text-sm ${isActive ? "font-black text-foreground" : "font-bold"}`}>{t(`creativity.${o.id}` as any)}</span>
                    {isActive && <Check size={16} className="text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Music Picker */}
      {showMusicPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowMusicPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">🎵 {t("music.title")}</h3>
              <button onClick={() => setShowMusicPicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowMusicPicker(false); goSearch("music"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedMusic ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
              >
                <span className="text-xl">🎼</span>
                <span className={`text-sm ${!selectedMusic ? "font-black text-foreground" : "font-bold"}`}>{t("music.all")}</span>
                {!selectedMusic && <Check size={16} className="text-primary ml-auto" />}
              </button>
              {musicOptions.map((o) => {
                const isActive = selectedMusic === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => { setShowMusicPicker(false); goSearch("music", o.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <span className={`text-sm ${isActive ? "font-black text-foreground" : "font-bold"}`}>{t(`music.${o.id}` as any)}</span>
                    {isActive && <Check size={16} className="text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Development Picker */}
      {showDevelopmentPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowDevelopmentPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">🌱 {t("development.title")}</h3>
              <button onClick={() => setShowDevelopmentPicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowDevelopmentPicker(false); goSearch("development"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedDevelopment ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
              >
                <span className="text-xl">✨</span>
                <span className={`text-sm ${!selectedDevelopment ? "font-black text-foreground" : "font-bold"}`}>{t("development.all")}</span>
                {!selectedDevelopment && <Check size={16} className="text-primary ml-auto" />}
              </button>
              {developmentOptions.map((o) => {
                const isActive = selectedDevelopment === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => { setShowDevelopmentPicker(false); goSearch("development", o.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <span className={`text-sm ${isActive ? "font-black text-foreground" : "font-bold"}`}>{t(`development.${o.id}` as any)}</span>
                    {isActive && <Check size={16} className="text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Special Picker */}
      {showSpecialPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowSpecialPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">💖 {t("special.title")}</h3>
              <button onClick={() => setShowSpecialPicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowSpecialPicker(false); goSearch("special"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedSpecial ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
              >
                <span className="text-xl">✨</span>
                <span className={`text-sm ${!selectedSpecial ? "font-black text-foreground" : "font-bold"}`}>{t("special.all")}</span>
                {!selectedSpecial && <Check size={16} className="text-primary ml-auto" />}
              </button>
              {specialOptions.map((o) => {
                const isActive = selectedSpecial === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => { setShowSpecialPicker(false); goSearch("special", o.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <span className={`text-sm ${isActive ? "font-black text-foreground" : "font-bold"}`}>{t(`special.${o.id}` as any)}</span>
                    {isActive && <Check size={16} className="text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showCityPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowCityPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">🏙️ {t("home.select_city")}</h3>
              <button onClick={() => setShowCityPicker(false)} aria-label="Закрыть" className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
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
            <BrandLogo size="sm" />{city}<ChevronDown size={18} className="text-primary-foreground" />
          </button>
        </div>
        <h1 className="text-center font-black text-sm mb-2 text-primary-foreground">
          {`Детские кружки, секции и центры в ${city}`}
        </h1>

        <div className="relative">

          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "hsl(145, 70%, 35%)" }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                const sp = new URLSearchParams();
                sp.set("q", searchQuery.trim());
                if (city) sp.set("city", city);
                if (ageFilter !== "all") sp.set("age", ageFilter);
                navigate(`/search?${sp.toString()}`);
              }
            }}
            placeholder={t("home.search")}
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-bold focus:outline-none focus:ring-[3px] focus:ring-secondary border-[3px]"
            style={{ background: "white", color: "hsl(145, 70%, 30%)", boxShadow: "var(--shadow-cartoon)", borderColor: "hsl(145, 50%, 75%)" }}
          />
          {searchQuery.trim() && (
            <button
              onClick={() => {
                const sp = new URLSearchParams();
                sp.set("q", searchQuery.trim());
                if (city) sp.set("city", city);
                if (ageFilter !== "all") sp.set("age", ageFilter);
                navigate(`/search?${sp.toString()}`);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-black bg-primary text-primary-foreground"
            >
              {"Найти"}
            </button>
          )}
        </div>
      </div>

      {/* Free banner */}
      <div className="mx-4 mt-4 p-4 rounded-2xl bg-secondary/10 border-2 border-secondary/30">
        <h3 className="font-black text-sm">{t("home.free_banner_title")}</h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t("home.free_banner_text")}</p>
      </div>

      {/* Age filter */}
      <div className="mx-4 mt-4 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-sm font-black shrink-0 flex items-center gap-1">👶 {t("age.label")}</span>
        {([
          { id: "all", label: t("age.any") },
          { id: "0-3", label: t("age.0_3") },
          { id: "3-7", label: t("age.3_7") },
          { id: "7-12", label: t("age.7_12") },
          { id: "12+", label: t("age.12_plus") },
        ] as const).map((opt) => {
          const active = ageFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setAgeFilter(opt.id as typeof ageFilter)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-black border-[3px] transition-colors ${active ? "bg-primary/15 text-primary border-primary" : "bg-muted text-muted-foreground border-transparent hover:bg-muted/70"}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>


      {/* Categories */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-4">
          {categoryIds.map((id) => {
            const handleClick = () => {
              if (id === "languages") {
                setShowLanguagePicker(true);
                setSelectedCategory("languages");
                return;
              }
              if (id === "dance") {
                setShowDancePicker(true);
                setSelectedCategory("dance");
                return;
              }
              if (id === "sport") {
                setShowSportPicker(true);
                setSelectedCategory("sport");
                return;
              }
              if (id === "health") {
                setShowHealthPicker(true);
                setSelectedCategory("health");
                return;
              }
              if (id === "tutors") {
                setShowTutorsPicker(true);
                setSelectedCategory("tutors");
                return;
              }
              if (id === "creativity") {
                setShowCreativityPicker(true);
                setSelectedCategory("creativity");
                return;
              }
              if (id === "music") {
                setShowMusicPicker(true);
                setSelectedCategory("music");
                return;
              }
              if (id === "development") {
                setShowDevelopmentPicker(true);
                setSelectedCategory("development");
                return;
              }
              if (id === "special") {
                setShowSpecialPicker(true);
                setSelectedCategory("special");
                return;
              }
              goSearch(id);
            };
            const isActive = selectedCategory === id;
            return (
              <button key={id} className="cat-card" onClick={handleClick}>
                <div className={`cat-card-img ${isActive ? "!border-primary ring-2 ring-primary/30" : ""}`}>
                  <img src={categoryIcons[id]} alt="" className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-foreground leading-tight">{t(`cat.${id}` as any)}</span>
                {id === "languages" && selectedLanguage && (
                  <span className="text-[9px] font-black text-primary leading-none">
                    {languageOptions.find((l) => l.id === selectedLanguage)?.emoji} {t(`lang.${selectedLanguage}` as any)}
                  </span>
                )}
                {id === "dance" && selectedDance && (
                  <span className="text-[9px] font-black text-primary leading-none">
                    {danceOptions.find((d) => d.id === selectedDance)?.emoji} {t(`dance.${selectedDance}` as any)}
                  </span>
                )}
                {id === "sport" && selectedSport && (
                  <span className="text-[9px] font-black text-primary leading-none">
                    {sportOptions.find((s) => s.id === selectedSport)?.emoji} {t(`sport.${selectedSport}` as any)}
                  </span>
                )}
                {id === "health" && selectedHealth && (
                  <span className="text-[9px] font-black text-primary leading-none">
                    {healthOptions.find((h) => h.id === selectedHealth)?.emoji} {t(`health.${selectedHealth}` as any)}
                  </span>
                )}
                {id === "tutors" && selectedTutors && (
                  <span className="text-[9px] font-black text-primary leading-none">
                    {tutorsOptions.find((o) => o.id === selectedTutors)?.emoji} {t(`tutors.${selectedTutors}` as any)}
                  </span>
                )}
                {id === "creativity" && selectedCreativity && (
                  <span className="text-[9px] font-black text-primary leading-none">
                    {creativityOptions.find((o) => o.id === selectedCreativity)?.emoji} {t(`creativity.${selectedCreativity}` as any)}
                  </span>
                )}
                {id === "music" && selectedMusic && (
                  <span className="text-[9px] font-black text-primary leading-none">
                    {musicOptions.find((o) => o.id === selectedMusic)?.emoji} {t(`music.${selectedMusic}` as any)}
                  </span>
                )}
                {id === "development" && selectedDevelopment && (
                  <span className="text-[9px] font-black text-primary leading-none">
                    {developmentOptions.find((o) => o.id === selectedDevelopment)?.emoji} {t(`development.${selectedDevelopment}` as any)}
                  </span>
                )}
                {id === "special" && selectedSpecial && (
                  <span className="text-[9px] font-black text-primary leading-none">
                    {specialOptions.find((o) => o.id === selectedSpecial)?.emoji} {t(`special.${selectedSpecial}` as any)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clubs */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="section-title">{t("home.popular")}</h2>
          <button onClick={() => navigate("/map")} className="text-primary text-sm font-black">{t("home.all")}</button>
        </div>

        {loadingClubs ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
        ) : clubs.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm text-muted-foreground font-bold">{t("home.not_found")}</p>
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
            {clubs.map((club, i) => {
              const name = tField(club.name_ru, club.name_kz, club.name_en);
              return (
                <div key={club.id} onClick={() => navigate(`/club/${club.id}`)}
                  className="min-w-[160px] md:min-w-0 cartoon-card overflow-hidden shrink-0 md:shrink cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                  <div className="relative h-24">
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
          <button onClick={() => navigate("/map")} className="text-primary text-sm font-black">{t("home.all")}</button>
        </div>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clubs.slice(0, 3).map((club, i) => {
            const name = tField(club.name_ru, club.name_kz, club.name_en);
            return (
              <div key={`nearby-${club.id}`} onClick={() => navigate(`/club/${club.id}`)}
                className="flex gap-3 cartoon-card p-3 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2" style={{ borderColor: "hsl(var(--foreground) / 0.06)" }}>
                  {safeImageUrl(club.avatar_url) ? (
                    <img src={safeImageUrl(club.avatar_url)} alt={name} className="w-full h-full object-cover" />
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
