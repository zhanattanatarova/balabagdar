import { Button } from "@/components/ui/button";
import CatalogEvents from "@/components/CatalogEvents";
import discoveryScene from "@/assets/discovery-brush.jpg";
import photoCreativity from "@/assets/category-creativity.jpg";
import photoSport from "@/assets/category-sport.jpg";
import photoDevelopment from "@/assets/category-development.jpg";
import photoSpeech from "@/assets/category-speech.jpg";
import photoDance from "@/assets/category-dance.jpg";
import photoRobotics from "@/assets/category-robotics.jpg";
import photoSwim from "@/assets/category-swim.jpg";
import photoMusic from "@/assets/category-music.jpg";
import photoHealth from "@/assets/category-health.jpg";
import photoLanguages from "@/assets/category-languages.jpg";
import photoSpecial from "@/assets/category-special.jpg";
import photoCamp from "@/assets/category-camp.jpg";
import SectionLinks from "@/components/sections/SectionLinks";
import CollectionsCarousel from "@/components/sections/CollectionsCarousel";
import { useState, useMemo, useEffect, useRef } from "react";
import { Search, MapPin, ChevronDown, ChevronLeft, ChevronRight, Star, ArrowRight, X, Check, Loader2, Navigation, MessageCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Link, useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { safeImageUrl } from "@/lib/safeUrl";
import { popularSort } from "@/lib/popular";
import { clubAge, clubCategoryLabels, clubLocation, clubPrice, hasRealAge } from "@/lib/clubDisplay";
import { translations, type TranslationKey } from "@/i18n/translations";
import BrandLogo from "@/components/BrandLogo";
import { CITIES } from "@/lib/cities";
import ClubInitialAvatar from "@/components/ClubInitialAvatar";
import TwoGisBadge from "@/components/TwoGisBadge";
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

const cities = CITIES;

const categoryIcons: Record<string, string> = {
 creativity: photoCreativity, sport: photoSport, development: photoDevelopment,
 speech: photoSpeech, dance: photoDance, robotics: photoRobotics, swim: photoSwim,
 music: photoMusic, health: photoHealth, tutors: photoLanguages, languages: photoLanguages,
 shops: photoCreativity, special: photoSpecial, mini_garden: photoDevelopment,
 garden: photoDevelopment, school: photoLanguages, correction: photoSpecial,
 neuropsychology: photoDevelopment, it: photoRobotics, camp: photoCamp, scouts: photoCamp,
};

const categoryIds = ["creativity", "sport", "development", "speech", "dance", "robotics", "swim", "music", "health", "languages", "special", "camp", "mini_garden", "garden", "school", "correction", "neuropsychology", "tutors", "it", "scouts", "shops"];


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

type NearbyClub = Record<string, any> & { distanceKm: number };

const distanceInKm = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
  const toRadians = (value: number) => value * Math.PI / 180;
  const latDistance = toRadians(toLat - fromLat);
  const lngDistance = toRadians(toLng - fromLng);
  const a = Math.sin(latDistance / 2) ** 2
    + Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(lngDistance / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

interface HomePageProps {
  city: string;
  setCity: (city: string) => void;
}

const HomePage = ({ city, setCity }: HomePageProps) => {
  const { user } = useAuth();
  const { t, tField, lang } = useLanguage();
  const navigate = useNavigate();
  const searchHref = (cat: string, sub?: string | null) => {
    const sp = new URLSearchParams();
    sp.set("cat", cat);
    if (sub) sp.set("sub", sub);
    if (city) sp.set("city", city);
    if (ageFilter !== "all") sp.set("age", ageFilter);
    if (searchQuery.trim()) sp.set("q", searchQuery.trim());
    return `/search?${sp.toString()}`;
  };
  const goSearch = (cat: string, sub?: string | null) => navigate(searchHref(cat, sub));
  const [showAllCategories, setShowAllCategories] = useState(false);
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
  const [unknownAgeClubs, setUnknownAgeClubs] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [nearbyClubs, setNearbyClubs] = useState<NearbyClub[]>([]);
  const [locating, setLocating] = useState(false);
  const [locationFailed, setLocationFailed] = useState(false);
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
        const { data } = await query;
        const all = data || [];
        setClubs(all.filter((c: any) => hasRealAge(c.age_min, c.age_max) && (c.age_min ?? 0) <= hi && (c.age_max ?? 99) >= lo));
        setUnknownAgeClubs(all.filter((c: any) => !hasRealAge(c.age_min, c.age_max)));
        setLoadingClubs(false);
        return;
      }

      const { data } = await query;
      setUnknownAgeClubs([]);
      setClubs(data || []);
      setLoadingClubs(false);
    };

    const debounce = setTimeout(fetchClubs, searchQuery ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [city, selectedCategory, selectedLanguage, selectedDance, selectedSport, selectedHealth, selectedTutors, selectedCreativity, selectedMusic, selectedDevelopment, selectedSpecial, searchQuery, ageFilter, matchedCategoryIds]);

  const popularClubs = useMemo(() => popularSort(clubs), [clubs]);
  const popularRow = useRef<HTMLDivElement>(null);
  const scrollPopular = (direction: number) => {
    const row = popularRow.current;
    if (!row) return;
    row.scrollBy({ left: direction * row.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const showNearby = () => {
    if (!navigator.geolocation) {
      setLocationFailed(true);
      return;
    }
    setLocating(true);
    setLocationFailed(false);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { data } = await supabase
        .from("clubs")
        .select("*")
        .eq("is_active", true);
      const located: NearbyClub[] = [];
      for (const club of data || []) {
        if (typeof club.latitude !== "number" || typeof club.longitude !== "number") continue;
        located.push({
          ...club,
          distanceKm: distanceInKm(coords.latitude, coords.longitude, club.latitude, club.longitude),
        });
      }
      setNearbyClubs(located.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3));
      setLocationFailed(located.length === 0);
      setLocating(false);
    }, () => {
      setNearbyClubs([]);
      setLocationFailed(true);
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 });
  };

  const filteredCities = cities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()));

  return (
    <div className="catalog-page pb-12 max-w-6xl mx-auto bg-background min-h-screen">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {/* Language Picker */}
      {showLanguagePicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowLanguagePicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">🌍 {t("lang.title")}</h3>
              <button onClick={() => setShowLanguagePicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowLanguagePicker(false); goSearch("languages"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedLanguage ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
              <button onClick={() => setShowDancePicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowDancePicker(false); goSearch("dance"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedDance ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
              <button onClick={() => setShowSportPicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowSportPicker(false); goSearch("sport"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedSport ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
              <button onClick={() => setShowHealthPicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowHealthPicker(false); goSearch("health"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedHealth ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
              <button onClick={() => setShowTutorsPicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowTutorsPicker(false); goSearch("tutors"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedTutors ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
              <button onClick={() => setShowCreativityPicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowCreativityPicker(false); goSearch("creativity"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedCreativity ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
              <button onClick={() => setShowMusicPicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowMusicPicker(false); goSearch("music"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedMusic ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
              <button onClick={() => setShowDevelopmentPicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowDevelopmentPicker(false); goSearch("development"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedDevelopment ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
              <button onClick={() => setShowSpecialPicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setShowSpecialPicker(false); goSearch("special"); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors mb-1 ${!selectedSpecial ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}
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
              <button onClick={() => setShowCityPicker(false)} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input value={citySearch} onChange={(e) => setCitySearch(e.target.value)} placeholder={t("common.search_city")}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-[3px] focus:ring-primary border border-border" autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              {filteredCities.map((c) => (
                <button key={c} onClick={() => { setCity(c); setShowCityPicker(false); setCitySearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${c === city ? "bg-primary/15 border border-primary" : "hover:bg-muted border border-transparent"}`}>
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

      <section className="discovery-hero">
        <img src={discoveryScene} alt="" width={1920} height={1024} className="discovery-photo" />
        <div className="discovery-centers">
          {popularClubs.slice(0, 2).map((club, i) => {
            const name = tField(club.name_ru, club.name_kz, club.name_en);
            const photo = safeImageUrl(club.avatar_url);
            const labels = clubCategoryLabels(club.categories, t).slice(0, 2);
            return i === 0 ? (
              <Link key={club.id} to={`/club/${club.id}`} className="discovery-center featured">
                <span className="featured-media">{photo ? <img src={photo} alt="" width={96} height={96} /> : <ClubInitialAvatar name={name} size="md" />}<span className="featured-badge">{lang === "ru" ? "Популярное" : lang === "kz" ? "Танымал" : "Popular"}</span></span>
                <strong>{name}</strong>
                {club.reviews_count > 0 && <span className="center-rating"><Star size={12} className="fill-current" />{Number(club.rating).toFixed(1)}<span>· {club.reviews_count} {t("club.reviews")}</span></span>}
                <span className="center-meta">{[clubAge(club.age_min, club.age_max, lang), club.price_from > 0 ? clubPrice(club.price_from, club.price_currency, lang) : null].filter(Boolean).join(" · ")}</span>
                {labels.length > 0 && <span className="center-tags">{labels.map(l => <span key={l.id}>{l.label}</span>)}</span>}
              </Link>
            ) : (
              <Link key={club.id} to={`/club/${club.id}`} className="discovery-center compact">
                <span className="flex items-center gap-3">{photo ? <img src={photo} alt="" width={40} height={40} className="w-10 h-10 rounded-xl object-cover" /> : <ClubInitialAvatar name={name} size="sm" />}<span className="min-w-0"><strong>{name}</strong>{labels[0] && <small>{labels[0].label}</small>}</span></span>
                <span className="center-wa"><MessageCircle size={14} />{lang === "ru" ? "Написать в WhatsApp" : lang === "kz" ? "WhatsApp-қа жазу" : "Message on WhatsApp"}</span>
              </Link>
            );
          })}
        </div>
        <div className="discovery-content">
          <span className="hero-eyebrow"><Sparkles size={14} />BalaHub · {lang === "ru" ? "Детство с интересом" : lang === "kz" ? "Қызықты балалық шақ" : "A world to discover"}</span>
          <h1>{lang === "ru" ? "Кружки, секции и афиша для детей" : lang === "kz" ? "Балаларға арналған үйірмелер мен афиша" : "Kids’ clubs, activities and events"}<span>{city}</span></h1>
          <p>{lang === "ru" ? "Сравнивайте центры по возрасту, адресу и цене. Свяжитесь с ними напрямую в WhatsApp." : lang === "kz" ? "Орталықтарды жас, мекенжай және баға бойынша салыстырыңыз. WhatsApp арқылы тікелей хабарласыңыз." : "Compare centers by age, location and price. Get in touch directly on WhatsApp."}</p>
          <form className="discovery-search" onSubmit={e => { e.preventDefault(); navigate(searchHref(selectedCategory || "")); }}>
            <label className="search-field grow"><span>{lang === "ru" ? "Что ищете" : lang === "kz" ? "Не іздейсіз" : "Looking for"}</span><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={lang === "ru" ? "Рисование, танцы, логопед…" : lang === "kz" ? "Сурет, би, логопед…" : "Art, dance, speech…"} /></label>
            <label className="search-field"><span>{t("age.label").replace(/:$/, "")}</span><select value={ageFilter} onChange={e => setAgeFilter(e.target.value as typeof ageFilter)}><option value="all">{t("age.any")}</option><option value="0-3">{t("age.0_3")}</option><option value="3-7">{t("age.3_7")}</option><option value="7-12">{t("age.7_12")}</option><option value="12+">{t("age.12_plus")}</option></select></label>
            <label className="search-field"><span>{lang === "ru" ? "Направление" : lang === "kz" ? "Бағыт" : "Category"}</span><select value={selectedCategory || ""} onChange={e => setSelectedCategory(e.target.value || null)}><option value="">{lang === "ru" ? "Любое" : lang === "kz" ? "Кез келген" : "Any"}</option>{categoryIds.map(id => <option key={id} value={id}>{t(`cat.${id}` as TranslationKey)}</option>)}</select></label>
            <Button type="submit"><Search />{t("home.find")}</Button>
          </form>
          <div className="hero-facts"><div><strong>{loadingClubs ? "—" : clubs.length}</strong><span>{lang === "ru" ? "центров в городе" : lang === "kz" ? "қаладағы орталық" : "centers in the city"}</span></div><div><strong>{categoryIds.length}</strong><span>{lang === "ru" ? "направление" : lang === "kz" ? "бағыт" : "categories"}</span></div><div><strong>0 ₸</strong><span>{lang === "ru" ? "для родителей" : lang === "kz" ? "ата-аналарға" : "for parents"}</span></div></div>
        </div>
      </section>
      {/* Categories */}
      <section className="category-section px-4 mt-8">
        <div className="flex items-center justify-between gap-3 mb-5"><h2 className="section-title">{lang === "ru" ? "Направления" : lang === "kz" ? "Бағыттар" : "Categories"}</h2><Button variant="link" onClick={() => setShowAllCategories(!showAllCategories)} className="text-xs px-0">{showAllCategories ? (lang === "ru" ? "Свернуть" : lang === "kz" ? "Жасыру" : "Show less") : (lang === "ru" ? `Все ${categoryIds.length} направление` : lang === "kz" ? `Барлық ${categoryIds.length} бағыт` : `All ${categoryIds.length} categories`)}<ArrowRight /></Button></div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {(showAllCategories ? categoryIds : categoryIds.slice(0, 12)).map((id) => {
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
            };
            const opensPicker = ["languages", "dance", "sport", "health", "tutors", "creativity", "music", "development", "special"].includes(id);
            const isActive = selectedCategory === id;
            return (
              <Link key={id} to={searchHref(id)} className="cat-card" onClick={(e) => { if (opensPicker) { e.preventDefault(); handleClick(); } }}>
                <div className={`cat-card-img ${isActive ? "!border-primary ring-2 ring-primary/30" : ""}`}>
                  <img src={categoryIcons[id]} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-label">{t(`cat.${id}` as any)}</span>
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
              </Link>
            );
          })}
        </div>
      </section>

      <div className="catalog-shortcuts mt-6 space-y-4"><SectionLinks /><CollectionsCarousel /></div>

      {/* Age filter */}
      <div className="mx-4 mt-4 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-sm font-black shrink-0 flex items-center gap-1">{t("age.label")}</span>
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
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-black border transition-colors ${active ? "bg-primary/15 text-primary border-primary" : "bg-muted text-muted-foreground border-transparent hover:bg-muted/70"}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>


      {/* Clubs */}
      <div className="popular-section mt-12">
        <div className="flex items-center justify-between px-4 mb-5">
          <div><h2 className="section-title">{lang === "ru" ? "Популярные центры" : lang === "kz" ? "Танымал орталықтар" : "Popular centers"}</h2><p className="section-sub">{lang === "ru" ? "Чаще всего смотрят родители вашего города" : lang === "kz" ? "Қалаңыздағы ата-аналар жиі қарайды" : "Most viewed by parents in your city"}</p></div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => scrollPopular(-1)} aria-label={lang === "ru" ? "Предыдущие центры" : lang === "kz" ? "Алдыңғы орталықтар" : "Previous centers"} title={lang === "ru" ? "Предыдущие центры" : lang === "kz" ? "Алдыңғы орталықтар" : "Previous centers"} className="h-8 w-8"><ChevronLeft size={16} /></Button>
            <Button variant="outline" size="icon" onClick={() => scrollPopular(1)} aria-label={lang === "ru" ? "Следующие центры" : lang === "kz" ? "Келесі орталықтар" : "Next centers"} title={lang === "ru" ? "Следующие центры" : lang === "kz" ? "Келесі орталықтар" : "Next centers"} className="h-8 w-8"><ChevronRight size={16} /></Button>
            <Link to="/map" className="pill-link">{lang === "ru" ? `Все ${loadingClubs ? "" : clubs.length} центров` : lang === "kz" ? "Барлық орталықтар" : "All centers"}</Link>
          </div>
        </div>

        {loadingClubs ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
        ) : clubs.length === 0 ? (
          unknownAgeClubs.length > 0 ? (
            <p className="px-4 text-sm text-muted-foreground font-bold">{lang === "kz" ? "Осы жасқа нақты сәйкес орталықтар жоқ." : lang === "en" ? "No centers with this exact age yet." : "Центров с точно подходящим возрастом пока нет."}</p>
          ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm text-muted-foreground font-bold">{t("home.not_found")}</p>
            <button onClick={() => { setAgeFilter("all"); setSelectedCategory(null); setSearchQuery(""); }} className="mt-3 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black">{lang === "kz" ? "Сүзгілерді тазалау" : lang === "en" ? "Reset filters" : "Сбросить фильтры"}</button>
          </div>
          )
        ) : (
          <div ref={popularRow} className="popular-row scrollbar-none">
            {popularClubs.map((club) => {
              const name = tField(club.name_ru, club.name_kz, club.name_en);
              const categoryLabels = clubCategoryLabels(club.categories, t);
              return (
                <Link key={club.id} to={`/club/${club.id}`} className="popular-card">
                  <div className="popular-media">
                    {safeImageUrl(club.avatar_url) ? (
                      <img src={safeImageUrl(club.avatar_url)} alt={name} loading="lazy" />
                    ) : (
                      <span className="popular-placeholder" aria-hidden="true" />
                    )}
                    <ClubInitialAvatar name={name} size="sm" className="popular-initial" />
                  </div>
                  <div className="popular-body">
                    <h3 className="font-bold text-sm leading-snug line-clamp-1">{name}</h3>
                    {club.reviews_count > 0 && (
                      <div className="center-rating mt-1">
                        <Star size={12} className="fill-current" />{Number(club.rating).toFixed(1)}<span>· {club.reviews_count} {t("club.reviews")}</span>
                      </div>
                    )}
                    <TwoGisBadge rating={club.twogis_rating} count={club.twogis_reviews_count} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <MapPin size={12} className="text-primary shrink-0" /><span className="truncate">{clubLocation(club.city, club.address)}</span>
                    </p>
                    {club.price_from > 0 && (
                      <p className="text-xs font-semibold text-primary mt-1">
                        {clubPrice(club.price_from, club.price_currency, lang)}
                      </p>
                    )}
                    <div className="center-tags mt-2">
                      {clubAge(club.age_min, club.age_max, lang) && <span>{clubAge(club.age_min, club.age_max, lang)}</span>}
                      {categoryLabels.map((category) => <span key={category.id}>{category.label}</span>)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        {!loadingClubs && ageFilter !== "all" && unknownAgeClubs.length > 0 && (
          <div className="mt-5 px-4">
            <h3 className="font-black text-sm mb-1">{lang === "kz" ? "Жасы көрсетілмеген — орталықтан нақтылаңыз" : lang === "en" ? "Age not specified — ask the center" : "Возраст не указан — уточняйте в центре"}</h3>
            <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto pb-2 scrollbar-none">
              {unknownAgeClubs.slice(0, 30).map((club) => {
                const name = tField(club.name_ru, club.name_kz, club.name_en);
                return (
                  <Link key={club.id} to={`/club/${club.id}`} className="block min-w-[150px] md:min-w-0 cartoon-card p-3 shrink-0 md:shrink">
                    {safeImageUrl(club.avatar_url) ? <img src={safeImageUrl(club.avatar_url)} alt={name} loading="lazy" className="h-12 w-12 rounded-xl object-cover" /> : <ClubInitialAvatar name={name} size="sm" />}
                    <p className="font-black text-xs mt-2 line-clamp-2">{name}</p>
                    <p className="text-[11px] text-muted-foreground font-bold">{clubLocation(club.address, club.city)}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CatalogEvents city={city} />
      <div className="px-4 mt-8">
        {nearbyClubs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <button onClick={showNearby} disabled={locating} className="cartoon-btn bg-primary text-primary-foreground px-4 py-2.5 flex items-center gap-2 disabled:opacity-60">
              {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {t(locating ? "home.locating" : "home.show_nearby")}
            </button>
            {locationFailed && <p className="text-xs font-bold text-muted-foreground">{t("home.location_unavailable")}</p>}
          </div>
        ) : (
          <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">{t("home.nearby")}</h2>
            <Link to="/map" className="text-primary text-sm font-black">{t("home.all")}</Link>
          </div>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {nearbyClubs.map((club, i) => {
            const name = tField(club.name_ru, club.name_kz, club.name_en);
            const categoryLabels = clubCategoryLabels(club.categories, t);
            return (
              <Link key={`nearby-${club.id}`} to={`/club/${club.id}`}
                className="flex gap-3 cartoon-card p-3 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border" style={{ borderColor: "hsl(var(--foreground) / 0.06)" }}>
                  {safeImageUrl(club.avatar_url) ? (
                    <img src={safeImageUrl(club.avatar_url)} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center"><ClubInitialAvatar name={name} size="md" className="h-full w-full rounded-none shadow-none" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="font-black text-sm truncate">{name}</h3>
                   <p className="text-xs font-black text-primary mt-0.5">{club.distanceKm.toLocaleString(lang === "en" ? "en-US" : lang === "kz" ? "kk-KZ" : "ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {t("common.km")}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 font-bold"><MapPin size={10} className="text-primary" />{clubLocation(club.city, club.address)}</p>
                  {club.reviews_count > 0 && (
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-secondary fill-secondary" />
                        <span className="text-xs font-black">{club.rating}</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{club.reviews_count} {t("club.reviews")}</span>
                    </div>
                  )}
                  <TwoGisBadge rating={club.twogis_rating} count={club.twogis_reviews_count} className="mt-1.5" />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {clubAge(club.age_min, club.age_max, lang) && (
                      <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg">{clubAge(club.age_min, club.age_max, lang)}</span>
                    )}
                    {categoryLabels.map((category) => (
                      <span key={category.id} className="text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded-lg">{category.label}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight size={16} className="text-primary shrink-0 mt-5" />
              </Link>
            );
          })}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
