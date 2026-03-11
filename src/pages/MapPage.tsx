import { MapPin, Star, Phone, Navigation } from "lucide-react";
import { useState } from "react";
import clubSoccer from "@/assets/club-soccer.jpg";
import clubArt from "@/assets/club-art.jpg";
import clubRobotics from "@/assets/club-robotics.jpg";
import clubDance from "@/assets/club-dance.jpg";
import clubSwim from "@/assets/club-swim.jpg";

const clubs = [
  { id: 1, name: "Футбольная школа «Голеадор»", address: "ул. Абая 52", phone: "+7 777 123 4567", rating: 4.8, age: "5–12 лет", x: 35, y: 40, img: clubSoccer, dist: "1.2 км" },
  { id: 2, name: "Студия «Кисточка»", address: "ул. Розыбакиева 78", phone: "+7 777 234 5678", rating: 4.9, age: "4–10 лет", x: 55, y: 30, img: clubArt, dist: "0.8 км" },
  { id: 3, name: "Робототехника KidsTech", address: "пр. Аль-Фараби 15", phone: "+7 777 345 6789", rating: 4.7, age: "6–14 лет", x: 70, y: 55, img: clubRobotics, dist: "2.1 км" },
  { id: 4, name: "Танцы «Ритм»", address: "ул. Тимирязева 42", phone: "+7 777 456 7890", rating: 4.6, age: "4–16 лет", x: 25, y: 65, img: clubDance, dist: "1.5 км" },
  { id: 5, name: "Плавание «Дельфин»", address: "ул. Жандосова 98", phone: "+7 777 567 8901", rating: 4.5, age: "3–12 лет", x: 50, y: 70, img: clubSwim, dist: "3.0 км" },
];

const MapPage = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedClub = clubs.find((c) => c.id === selected);

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-black">Карта кружков</h1>
        <p className="text-sm text-muted-foreground">Кружки рядом с вами в Алматы</p>
      </div>

      {/* Map area */}
      <div className="mx-4 relative rounded-3xl h-72 overflow-hidden border border-border/50 shadow-lg" style={{
        background: "linear-gradient(135deg, hsl(140, 40%, 92%) 0%, hsl(100, 30%, 90%) 50%, hsl(140, 35%, 88%) 100%)"
      }}>
        {/* Decorative roads */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300">
          <path d="M0 150 Q100 120 200 150 Q300 180 400 140" stroke="hsl(152, 40%, 40%)" strokeWidth="3" fill="none"/>
          <path d="M150 0 Q170 100 160 200 Q150 250 180 300" stroke="hsl(152, 40%, 40%)" strokeWidth="3" fill="none"/>
          <path d="M50 80 Q150 90 250 70 Q350 50 400 80" stroke="hsl(152, 40%, 40%)" strokeWidth="2" fill="none"/>
        </svg>

        {/* User location */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-card shadow-lg" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-blue-400 animate-ping opacity-40" />
        </div>

        {/* Club markers */}
        {clubs.map((club) => (
          <button
            key={club.id}
            onClick={() => setSelected(club.id === selected ? null : club.id)}
            className={`absolute transition-all duration-300 z-20 ${selected === club.id ? "scale-125" : "hover:scale-110"}`}
            style={{ left: `${club.x}%`, top: `${club.y}%`, transform: "translate(-50%, -100%)" }}
          >
            <div className={`relative ${selected === club.id ? "drop-shadow-xl" : "drop-shadow-md"}`}>
              <div className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition-colors ${
                selected === club.id ? "border-accent" : "border-card"
              }`}>
                <img src={club.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 ${
                selected === club.id ? "bg-accent" : "bg-card"
              }`} />
            </div>
          </button>
        ))}
      </div>

      {/* Selected card */}
      {selectedClub && (
        <div className="mx-4 mt-3 bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 animate-slide-up">
          <div className="flex gap-3 p-3">
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
              <img src={selectedClub.img} alt={selectedClub.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 py-0.5">
              <h3 className="font-extrabold text-sm leading-tight">{selectedClub.name}</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="badge-rating">
                  <Star size={10} className="text-secondary fill-secondary" />
                  {selectedClub.rating}
                </div>
                <span className="text-xs text-muted-foreground">{selectedClub.age}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin size={12} />
                {selectedClub.address}
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Phone size={12} />
                {selectedClub.phone}
              </div>
            </div>
          </div>
          <div className="flex gap-2 px-3 pb-3">
            <button className="flex-1 btn-primary text-sm py-2.5">Подробнее</button>
            <button className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-muted text-foreground font-bold text-sm">
              <Navigation size={14} />
              {selectedClub.dist}
            </button>
          </div>
        </div>
      )}

      {/* All clubs */}
      <div className="px-4 mt-5">
        <h2 className="section-title mb-3">Все кружки</h2>
        <div className="flex flex-col gap-2.5">
          {clubs.map((club, i) => (
            <button
              key={club.id}
              onClick={() => setSelected(club.id)}
              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all text-left animate-slide-up ${
                selected === club.id
                  ? "border-primary bg-green-light shadow-md"
                  : "border-border/50 bg-card hover:shadow-sm"
              }`}
              style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <img src={club.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{club.name}</p>
                <p className="text-xs text-muted-foreground">{club.address}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5">
                  <Star size={11} className="text-secondary fill-secondary" />
                  <span className="text-xs font-bold">{club.rating}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{club.dist}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
