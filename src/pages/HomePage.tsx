import { useState, useMemo } from "react";
import { Search, MapPin, ChevronDown, Star, ArrowRight, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/balahub-logo.png";
import clubSoccer from "@/assets/club-soccer.jpg";
import clubArt from "@/assets/club-art.jpg";
import clubRobotics from "@/assets/club-robotics.jpg";
import clubDance from "@/assets/club-dance.jpg";
import clubSwim from "@/assets/club-swim.jpg";
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
import { toast } from "@/hooks/use-toast";

const cities = [
  "Алматы", "Астана", "Шымкент", "Караганда", "Актобе",
  "Тараз", "Павлодар", "Усть-Каменогорск", "Семей", "Атырау",
  "Костанай", "Кызылорда", "Уральск", "Петропавловск", "Актау",
  "Темиртау", "Туркестан", "Кокшетау", "Талдыкорган", "Экибастуз",
  "Рудный", "Жезказган", "Каскелен", "Талгар", "Конаев",
  "Жанаозен", "Байконур", "Балхаш", "Кентау", "Сатпаев",
  "Сарань", "Щучинск", "Риддер", "Аксай", "Степногорск",
];

const categories = [
  { label: "Творчество", icon: iconCreativity, id: "creativity" },
  { label: "Спорт", icon: iconSport, id: "sport" },
  { label: "Развитие", icon: iconDevelopment, id: "development" },
  { label: "Логопеды", icon: iconSpeech, id: "speech" },
  { label: "Танцы", icon: iconDance, id: "dance" },
  { label: "Робототехника", icon: iconRobotics, id: "robotics" },
  { label: "Бассейн", icon: iconSwim, id: "swim" },
  { label: "Музыка", icon: iconMusic, id: "music" },
  { label: "Здоровье", icon: iconHealth, id: "health" },
  { label: "Репетиторы", icon: iconTutors, id: "tutors" },
];

const popularClubs = [
  { name: "Арт Студия", rating: 4.9, district: "Арбитова", age: "4–10 лет", img: clubArt, price: "от 12 000 ₸", reviews: 31 },
  { name: "Футбольная школа", rating: 4.8, district: "Абылай Хана", age: "5–12 лет", img: clubSoccer, price: "от 15 000 ₸", reviews: 24 },
  { name: "РобоПарк", rating: 4.7, district: "Авиатор", age: "6–14 лет", img: clubRobotics, price: "от 20 000 ₸", reviews: 18 },
  { name: "Танцы «Ритм»", rating: 4.6, district: "Медеуский р-н", age: "4–16 лет", img: clubDance, price: "от 10 000 ₸", reviews: 42 },
  { name: "Плавание «Дельфин»", rating: 4.5, district: "Ауэзовский р-н", age: "3–12 лет", img: clubSwim, price: "от 18 000 ₸", reviews: 15 },
];

const HomePage = () => {
  const { user } = useAuth();
  const [city, setCity] = useState("Астана");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredClubs = useMemo(() => {
    if (!searchQuery.trim()) return popularClubs;
    return popularClubs.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleCategoryClick = (cat: typeof categories[0]) => {
    toast({ title: cat.label, description: `Открываем раздел "${cat.label}"...` });
  };

  const handleClubClick = (club: typeof popularClubs[0]) => {
    toast({ title: club.name, description: `${club.district} · ${club.age} · ${club.price}` });
  };

  return (
    <div className="pb-24 max-w-lg mx-auto bg-background min-h-screen">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {/* City Picker */}
      {showCityPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowCityPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">🏙️ Выберите город</h3>
              <button onClick={() => setShowCityPicker(false)} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Поиск города..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-[3px] focus:ring-primary border-2 border-border"
                  autoFocus
                />
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
              {filteredCities.length === 0 && <p className="text-center text-muted-foreground text-sm py-8 font-bold">😕 Город не найден</p>}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center justify-center mb-3">
          <button onClick={() => setShowCityPicker(true)} className="flex items-center gap-1.5 text-foreground font-black text-lg">
            <img src={logo} alt="" className="w-7 h-7" />
            {city}
            <ChevronDown size={18} className="text-primary" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти кружок или репетитора..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-[3px] focus:ring-primary border-2 border-border"
            style={{ boxShadow: "var(--shadow-cartoon)" }}
          />
        </div>
      </div>

      {/* Categories grid */}
      <div className="px-4">
        <div className="grid grid-cols-5 gap-2">
          {categories.map((cat) => (
            <button key={cat.id} className="cat-card" onClick={() => handleCategoryClick(cat)}>
              <div className="cat-card-img">
                <img src={cat.icon} alt={cat.label} className="w-full h-full object-contain" />
              </div>
              <span className="text-[10px] font-bold text-foreground leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular clubs */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="section-title">⭐ Популярные кружки</h2>
          <button className="text-primary text-sm font-black">Все →</button>
        </div>

        {filteredClubs.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm text-muted-foreground font-bold">Ничего не найдено по запросу «{searchQuery}»</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
            {filteredClubs.map((club, i) => (
              <div
                key={club.name}
                onClick={() => handleClubClick(club)}
                className="min-w-[160px] cartoon-card overflow-hidden shrink-0 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
              >
                <div className="relative h-24">
                  <img src={club.img} alt={club.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <h3 className="font-black text-xs leading-snug line-clamp-1">{club.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-secondary fill-secondary" />
                    <Star size={11} className="text-secondary fill-secondary" />
                    <Star size={11} className="text-secondary fill-secondary" />
                    <Star size={11} className="text-secondary fill-secondary" />
                    <Star size={11} className="text-muted-foreground/30" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-bold">
                    <MapPin size={10} className="text-primary" />{club.district}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearby list */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">📍 Рядом с вами</h2>
          <button className="text-primary text-sm font-black">Все →</button>
        </div>
        <div className="flex flex-col gap-3">
          {popularClubs.slice(0, 3).map((club, i) => (
            <div
              key={`nearby-${club.name}`}
              onClick={() => handleClubClick(club)}
              className="flex gap-3 cartoon-card p-3 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2" style={{ borderColor: "hsl(var(--foreground) / 0.06)" }}>
                <img src={club.img} alt={club.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <h3 className="font-black text-sm truncate">{club.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 font-bold"><MapPin size={10} className="text-primary" />{club.district}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-secondary fill-secondary" />
                    <span className="text-xs font-black">{club.rating}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{club.reviews} отзывов</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-primary shrink-0 mt-5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
