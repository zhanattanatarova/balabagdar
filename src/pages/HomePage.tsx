import { useState, useMemo } from "react";
import { Search, MapPin, ChevronDown, Star, ArrowRight, X, Check, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/balahub-logo.png";
import clubSoccer from "@/assets/club-soccer.jpg";
import clubArt from "@/assets/club-art.jpg";
import clubRobotics from "@/assets/club-robotics.jpg";
import clubDance from "@/assets/club-dance.jpg";
import clubSwim from "@/assets/club-swim.jpg";
import catSport from "@/assets/cat-sport.jpg";
import catCreativity from "@/assets/cat-creativity.jpg";
import catDevelopment from "@/assets/cat-development.jpg";
import catSpeech from "@/assets/cat-speech.jpg";
import catTutors from "@/assets/cat-tutors.jpg";
import catNutrition from "@/assets/cat-nutrition.jpg";
import catOsteopath from "@/assets/cat-osteopath.jpg";
import catMusic from "@/assets/cat-music.jpg";
import catLanguages from "@/assets/cat-languages.jpg";
import catLfk from "@/assets/cat-lfk.jpg";
import catMassage from "@/assets/cat-massage.jpg";
import catPool from "@/assets/cat-pool.jpg";
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
  { label: "Спорт", img: catSport, id: "sport" },
  { label: "Творчество", img: catCreativity, id: "creativity" },
  { label: "Развитие", img: catDevelopment, id: "development" },
  { label: "Логопеды", img: catSpeech, id: "speech" },
  { label: "Репетиторы", img: catTutors, id: "tutors" },
  { label: "Языки", img: catLanguages, id: "languages" },
  { label: "ЛФК", img: catLfk, id: "lfk" },
  { label: "Массаж", img: catMassage, id: "massage" },
  { label: "Бассейн", img: catPool, id: "pool" },
  { label: "Нутрициологи", img: catNutrition, id: "nutrition" },
  { label: "Остеопаты", img: catOsteopath, id: "osteopath" },
  { label: "Музыка", img: catMusic, id: "music" },
];

const popularClubs = [
  { name: "Футбольная школа «Голеадор»", rating: 4.8, district: "Алмалинский р-н", age: "5–12 лет", img: clubSoccer, price: "от 15 000 ₸", reviews: 24 },
  { name: "Студия «Кисточка»", rating: 4.9, district: "Бостандыкский р-н", age: "4–10 лет", img: clubArt, price: "от 12 000 ₸", reviews: 31 },
  { name: "Робототехника KidsTech", rating: 4.7, district: "Наурызбайский р-н", age: "6–14 лет", img: clubRobotics, price: "от 20 000 ₸", reviews: 18 },
  { name: "Танцы «Ритм»", rating: 4.6, district: "Медеуский р-н", age: "4–16 лет", img: clubDance, price: "от 10 000 ₸", reviews: 42 },
  { name: "Плавание «Дельфин»", rating: 4.5, district: "Ауэзовский р-н", age: "3–12 лет", img: clubSwim, price: "от 18 000 ₸", reviews: 15 },
];

const HomePage = () => {
  const { user } = useAuth();
  const [city, setCity] = useState("Алматы");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
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

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8);

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
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setShowCityPicker(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-border" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg">Выберите город</h3>
              <button onClick={() => setShowCityPicker(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Поиск города..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              {filteredCities.map((c) => (
                <button key={c} onClick={() => { setCity(c); setShowCityPicker(false); setCitySearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${c === city ? "bg-yellow-light" : "hover:bg-muted"}`}>
                  <MapPin size={16} className={c === city ? "text-primary" : "text-muted-foreground"} />
                  <span className={`text-sm ${c === city ? "font-bold text-primary-foreground" : "font-semibold"}`}>{c}</span>
                  {c === city && <Check size={16} className="text-primary ml-auto" />}
                </button>
              ))}
              {filteredCities.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Город не найден</p>}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ background: "var(--gradient-header)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="BalaHub" className="w-9 h-9 animate-wiggle" />
            <span className="text-primary-foreground font-black text-xl tracking-tight">BalaHub</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/notifications")} className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center relative">
              <Bell size={18} className="text-primary-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">3</span>
            </button>
            {user ? (
              <div className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-black">
                  {user.user_metadata?.phone?.slice(-2) || "👤"}
                </span>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="text-primary-foreground text-sm font-bold bg-primary-foreground/15 px-3.5 py-1.5 rounded-xl hover:bg-primary-foreground/25 transition-colors">
                Войти
              </button>
            )}
          </div>
        </div>
        <button onClick={() => setShowCityPicker(true)} className="flex items-center gap-1 text-primary-foreground/70 text-xs font-bold">
          <MapPin size={12} />{city}<ChevronDown size={12} />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 -mt-0 pb-4" style={{ background: "var(--gradient-header)" }}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск кружков, специалистов..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card text-foreground text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
          />
        </div>
      </div>

      {/* Categories grid */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Категории</h2>
          <button onClick={() => setShowAllCategories(!showAllCategories)} className="text-accent text-sm font-bold">
            {showAllCategories ? "Свернуть" : "Все"}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {visibleCategories.map((cat) => (
            <button key={cat.id} className="cat-card" onClick={() => handleCategoryClick(cat)}>
              <div className="cat-card-img">
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-[11px] font-bold text-foreground/80 leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search results or popular */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="section-title">{searchQuery ? "Результаты поиска" : "🔥 Популярные"}</h2>
          {!searchQuery && <button className="text-accent text-sm font-bold">Все</button>}
        </div>

        {filteredClubs.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm text-muted-foreground font-semibold">Ничего не найдено по запросу «{searchQuery}»</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
            {filteredClubs.map((club, i) => (
              <div
                key={club.name}
                onClick={() => handleClubClick(club)}
                className="min-w-[180px] bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 shrink-0 cursor-pointer hover:shadow-md active:scale-[0.97] transition-all animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
              >
                <div className="relative h-28">
                  <img src={club.img} alt={club.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 badge-rating">
                    <Star size={10} className="text-primary fill-primary" />
                    {club.rating}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-xs leading-snug line-clamp-2 min-h-[32px]">{club.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><MapPin size={10} />{club.district}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{club.reviews} отзывов</span>
                    <span className="text-xs font-bold text-accent">{club.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vertical list */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Рядом с вами</h2>
          <button className="text-accent text-sm font-bold">Все</button>
        </div>
        <div className="flex flex-col gap-2.5">
          {popularClubs.map((club, i) => (
            <div
              key={`nearby-${club.name}`}
              onClick={() => handleClubClick(club)}
              className="flex gap-3 bg-card rounded-xl p-2.5 border border-border/50 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
            >
              <div className="w-[68px] h-[68px] rounded-xl overflow-hidden shrink-0">
                <img src={club.img} alt={club.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <h3 className="font-bold text-sm truncate">{club.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin size={10} />{club.district}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-primary fill-primary" />
                    <span className="text-xs font-bold">{club.rating}</span>
                  </div>
                  <span className="text-xs font-bold text-accent">{club.price}</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted-foreground shrink-0 mt-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
