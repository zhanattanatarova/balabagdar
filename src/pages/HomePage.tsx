import { Search, MapPin, ChevronDown, Star, ArrowRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import clubSoccer from "@/assets/club-soccer.jpg";
import clubArt from "@/assets/club-art.jpg";
import clubRobotics from "@/assets/club-robotics.jpg";
import clubDance from "@/assets/club-dance.jpg";
import clubSwim from "@/assets/club-swim.jpg";

const categories = [
  { icon: "⚽", label: "Спорт" },
  { icon: "🎨", label: "Творчество" },
  { icon: "🧒", label: "Развитие" },
  { icon: "🗣️", label: "Логопеды" },
  { icon: "📚", label: "Репетиторы" },
  { icon: "🥗", label: "Питание" },
  { icon: "🦴", label: "Остеопаты" },
  { icon: "✨", label: "Все" },
];

const popularClubs = [
  { name: "Футбольная школа «Голеадор»", rating: 4.8, district: "Алмалинский р-н", age: "5–12 лет", img: clubSoccer, price: "от 15 000 ₸" },
  { name: "Студия рисования «Кисточка»", rating: 4.9, district: "Бостандыкский р-н", age: "4–10 лет", img: clubArt, price: "от 12 000 ₸" },
  { name: "Робототехника KidsTech", rating: 4.7, district: "Наурызбайский р-н", age: "6–14 лет", img: clubRobotics, price: "от 20 000 ₸" },
  { name: "Танцы «Ритм»", rating: 4.6, district: "Медеуский р-н", age: "4–16 лет", img: clubDance, price: "от 10 000 ₸" },
  { name: "Плавание «Дельфин»", rating: 4.5, district: "Ауэзовский р-н", age: "3–12 лет", img: clubSwim, price: "от 18 000 ₸" },
];

const HomePage = () => {
  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Hero Banner */}
      <div className="relative h-56 overflow-hidden">
        <img src={heroBanner} alt="Дети" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsla(160,50%,20%,0.3) 0%, hsla(160,50%,15%,0.85) 100%)" }} />
        
        <div className="absolute top-0 left-0 right-0 px-4 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/60 text-xs font-bold uppercase tracking-wider">Ваш город</p>
              <button className="flex items-center gap-1 text-primary-foreground font-extrabold text-base mt-0.5">
                <MapPin size={15} />
                Алматы
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-lg">🔔</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <h2 className="text-primary-foreground font-black text-xl leading-tight mb-3">
            Найдите лучшие<br />кружки для ребёнка
          </h2>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              placeholder="Кружки, логопеды, репетиторы..."
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-card text-foreground text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Категории</h2>
          <button className="text-primary text-sm font-bold flex items-center gap-0.5">
            Все <ArrowRight size={14} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className="flex flex-col items-center gap-1.5 min-w-[68px] py-3 px-2 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 shrink-0"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[10px] font-bold text-foreground/80 leading-tight text-center">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular — horizontal scroll with photo cards */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="section-title">🔥 Популярные</h2>
          <button className="text-primary text-sm font-bold flex items-center gap-0.5">
            Все <ArrowRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-0 px-4 scrollbar-none">
          {popularClubs.map((club, i) => (
            <div
              key={club.name}
              className="card-photo min-w-[200px] h-[260px] shrink-0 group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}
            >
              <img src={club.img} alt={club.name} className="group-hover:scale-105 transition-transform duration-500" />
              <div className="card-photo-overlay" />
              
              {/* Rating badge */}
              <div className="absolute top-3 right-3 badge-rating">
                <Star size={11} className="text-secondary fill-secondary" />
                {club.rating}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-primary-foreground font-bold text-sm leading-snug line-clamp-2">{club.name}</h3>
                <p className="text-primary-foreground/60 text-xs mt-1">{club.district}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-primary-foreground/50">{club.age}</span>
                  <span className="text-xs font-bold text-secondary">{club.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured large card */}
      <div className="px-4 mt-4">
        <div className="card-photo h-44 cursor-pointer group">
          <img src={clubArt} alt="Творчество" className="group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsla(152, 60%, 35%, 0.85) 0%, hsla(42, 100%, 50%, 0.7) 100%)" }} />
          <div className="absolute inset-0 p-5 flex flex-col justify-end">
            <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider">Подборка недели</p>
            <h3 className="text-primary-foreground font-black text-xl mt-1">Творческие студии</h3>
            <p className="text-primary-foreground/80 text-sm mt-1">12 студий рисования, лепки и дизайна для детей</p>
            <button className="mt-3 self-start bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary-foreground/30 transition-colors">
              Смотреть →
            </button>
          </div>
        </div>
      </div>

      {/* Vertical list cards */}
      <div className="px-4 mt-6">
        <h2 className="section-title mb-3">Рядом с вами</h2>
        <div className="flex flex-col gap-3">
          {popularClubs.slice(0, 3).map((club, i) => (
            <div
              key={`nearby-${club.name}`}
              className="flex gap-3 bg-card rounded-2xl p-2.5 border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <img src={club.img} alt={club.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <h3 className="font-bold text-sm truncate">{club.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{club.district}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-secondary fill-secondary" />
                    <span className="text-xs font-bold">{club.rating}</span>
                  </div>
                  <span className="text-xs font-bold text-primary">{club.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
