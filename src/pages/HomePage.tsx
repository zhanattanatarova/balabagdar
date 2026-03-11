import { Search, MapPin, ChevronDown, Star } from "lucide-react";
import { useState } from "react";

const categories = [
  { icon: "⚽", label: "Спорт", color: "bg-primary/10" },
  { icon: "🎨", label: "Творчество", color: "bg-yellow-soft/30" },
  { icon: "🧒", label: "Развитие", color: "bg-green-light" },
  { icon: "🗣️", label: "Логопеды", color: "bg-peach" },
  { icon: "📚", label: "Репетиторы", color: "bg-primary/10" },
  { icon: "🥗", label: "Нутрициологи", color: "bg-yellow-soft/30" },
  { icon: "🦴", label: "Остеопаты", color: "bg-green-light" },
];

const popularClubs = [
  {
    name: "Футбольная школа «Голеадор»",
    rating: 4.8,
    district: "Алмалинский р-н",
    age: "5–12 лет",
    img: "⚽",
  },
  {
    name: "Студия рисования «Кисточка»",
    rating: 4.9,
    district: "Бостандыкский р-н",
    age: "4–10 лет",
    img: "🎨",
  },
  {
    name: "Робототехника KidsTech",
    rating: 4.7,
    district: "Наурызбайский р-н",
    age: "6–14 лет",
    img: "🤖",
  },
  {
    name: "Танцы «Ритм»",
    rating: 4.6,
    district: "Медеуский р-н",
    age: "4–16 лет",
    img: "💃",
  },
];

const HomePage = () => {
  const [city, setCity] = useState("Алматы");

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-primary rounded-b-2xl px-4 pt-6 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm font-semibold">Ваш город</p>
            <button className="flex items-center gap-1 text-primary-foreground font-extrabold text-lg">
              <MapPin size={18} />
              {city}
              <ChevronDown size={16} />
            </button>
          </div>
          <span className="text-3xl">🌱</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            placeholder="Кружки, логопеды, репетиторы..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card text-foreground text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mt-5">
        <h2 className="text-lg font-extrabold mb-3">Категории</h2>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${cat.color} hover:scale-105 transition-transform duration-200`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[11px] font-bold text-foreground leading-tight text-center">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-extrabold mb-3">🔥 Популярные</h2>
        <div className="flex flex-col gap-3">
          {popularClubs.map((club, i) => (
            <div
              key={club.name}
              className="flex items-center gap-3 bg-card rounded-2xl p-3 shadow-sm border border-border animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}
            >
              <div className="w-14 h-14 rounded-xl bg-green-light flex items-center justify-center text-3xl shrink-0">
                {club.img}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{club.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{club.district} · {club.age}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="text-secondary fill-secondary" />
                  <span className="text-xs font-bold">{club.rating}</span>
                </div>
              </div>
              <button className="shrink-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-green-bright transition-colors">
                Открыть
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
