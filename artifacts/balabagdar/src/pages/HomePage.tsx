import { useState, useMemo, useEffect } from "react";
import { Search, MapPin, ChevronDown, Star, ArrowRight, X, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
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
};

const categoryIds = ["creativity", "sport", "development", "special", "speech", "dance", "robotics", "swim", "music", "health", "tutors", "languages", "shops"];

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

  useEffect(() => {
    const fetchClubs = async () => {
      setLoadingClubs(true);
      try {
        const params: Record<string, string> = { city };
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        // Pass subcategory as API param for proper DB-level filtering
        const getSubcategory = () => {
          if (selectedCategory === "languages") return selectedLanguage;
          if (selectedCategory === "dance") return selectedDance;
          if (selectedCategory === "sport") return selectedSport;
          if (selectedCategory === "health") return selectedHealth;
          if (selectedCategory === "tutors") return selectedTutors;
          if (selectedCategory === "creativity") return selectedCreativity;
          if (selectedCategory === "music") return selectedMusic;
          if (selectedCategory === "development") return selectedDevelopment;
          if (selectedCategory === "special") return selectedSpecial;
          return null;
        };
        const subcategory = getSubcategory();
        if (subcategory) params.subcategory = subcategory;

        const data = await api.clubs.list(params);
        setClubs(data || []);
      } catch {}
      setLoadingClubs(false);
    };

    const debounce = setTimeout(fetchClubs, searchQuery ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [city, selectedCategory, selectedLanguage, selectedDance, selectedSport, selectedHealth, selectedTutors, selectedCreativity, selectedMusic, selectedDevelopment, selectedSpecial, searchQuery]);

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
              <button onClick={() => setShowLanguagePicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setSelectedLanguage(null); setSelectedCategory(null); setShowLanguagePicker(false); }}
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
                    onClick={() => { setSelectedLanguage(lang.id); setSelectedCategory("languages"); setShowLanguagePicker(false); }}
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
              <button onClick={() => setShowDancePicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setSelectedDance(null); setSelectedCategory(null); setShowDancePicker(false); }}
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
                    onClick={() => { setSelectedDance(d.id); setSelectedCategory("dance"); setShowDancePicker(false); }}
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
              <button onClick={() => setShowSportPicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setSelectedSport(null); setSelectedCategory(null); setShowSportPicker(false); }}
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
                    onClick={() => { setSelectedSport(s.id); setSelectedCategory("sport"); setShowSportPicker(false); }}
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
              <button onClick={() => setShowHealthPicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setSelectedHealth(null); setSelectedCategory(null); setShowHealthPicker(false); }}
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
                    onClick={() => { setSelectedHealth(h.id); setSelectedCategory("health"); setShowHealthPicker(false); }}
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
              <button onClick={() => setShowTutorsPicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setSelectedTutors(null); setSelectedCategory(null); setShowTutorsPicker(false); }}
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
                    onClick={() => { setSelectedTutors(o.id); setSelectedCategory("tutors"); setShowTutorsPicker(false); }}
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
              <button onClick={() => setShowCreativityPicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setSelectedCreativity(null); setSelectedCategory(null); setShowCreativityPicker(false); }}
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
                    onClick={() => { setSelectedCreativity(o.id); setSelectedCategory("creativity"); setShowCreativityPicker(false); }}
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
              <button onClick={() => setShowMusicPicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setSelectedMusic(null); setSelectedCategory(null); setShowMusicPicker(false); }}
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
                    onClick={() => { setSelectedMusic(o.id); setSelectedCategory("music"); setShowMusicPicker(false); }}
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
              <button onClick={() => setShowDevelopmentPicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setSelectedDevelopment(null); setSelectedCategory(null); setShowDevelopmentPicker(false); }}
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
                    onClick={() => { setSelectedDevelopment(o.id); setSelectedCategory("development"); setShowDevelopmentPicker(false); }}
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
              <button onClick={() => setShowSpecialPicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <button
                onClick={() => { setSelectedSpecial(null); setSelectedCategory(null); setShowSpecialPicker(false); }}
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
                    onClick={() => { setSelectedSpecial(o.id); setSelectedCategory("special"); setShowSpecialPicker(false); }}
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
            <BrandLogo size="sm" />{city}<ChevronDown size={18} className="text-primary-foreground" />
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
              if (selectedCategory === id) {
                setSelectedCategory(null);
                setSelectedLanguage(null);
                setSelectedDance(null);
                setSelectedSport(null);
                setSelectedHealth(null);
                setSelectedTutors(null);
                setSelectedCreativity(null);
                setSelectedMusic(null);
                setSelectedDevelopment(null);
                setSelectedSpecial(null);
              } else {
                setSelectedCategory(id);
                setSelectedLanguage(null);
                setSelectedDance(null);
                setSelectedSport(null);
                setSelectedHealth(null);
                setSelectedTutors(null);
                setSelectedCreativity(null);
                setSelectedMusic(null);
                setSelectedDevelopment(null);
                setSelectedSpecial(null);
              }
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
              const name = tField(club.nameRu || club.name_ru, club.nameKz || club.name_kz, club.nameEn || club.name_en);
              const avatarUrl = club.avatarUrl || club.avatar_url;
              const reviewsCount = club.reviewsCount ?? club.reviews_count ?? 0;
              const priceFrom = club.priceFrom ?? club.price_from;
              const priceCurrency = club.priceCurrency || club.price_currency || "₸";
              return (
                <div key={club.id} onClick={() => navigate(`/club/${club.id}`)}
                  className="min-w-[160px] md:min-w-0 cartoon-card overflow-hidden shrink-0 md:shrink cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                  <div className="relative h-24">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center"><span className="text-3xl">🏫</span></div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-black text-xs leading-snug line-clamp-1">{name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} className="text-secondary fill-secondary" />
                      <span className="text-xs font-black">{club.rating || "—"}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">{reviewsCount} {t("club.reviews")}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-bold">
                      <MapPin size={10} className="text-primary" />{club.address || club.city}
                    </p>
                    <p className="text-[10px] font-bold text-primary mt-1">
                      {t("club.price")} {priceFrom?.toLocaleString()} {priceCurrency}
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
            const name = tField(club.nameRu || club.name_ru, club.nameKz || club.name_kz, club.nameEn || club.name_en);
            const avatarUrl = club.avatarUrl || club.avatar_url;
            const reviewsCount = club.reviewsCount ?? club.reviews_count ?? 0;
            return (
              <div key={`nearby-${club.id}`} onClick={() => navigate(`/club/${club.id}`)}
                className="flex gap-3 cartoon-card p-3 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2" style={{ borderColor: "hsl(var(--foreground) / 0.06)" }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
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
                    <span className="text-xs font-bold text-muted-foreground">{reviewsCount} {t("club.reviews")}</span>
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
