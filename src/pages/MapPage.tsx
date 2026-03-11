import { MapPin, Star, Phone, Clock } from "lucide-react";
import { useState } from "react";

const clubs = [
  { id: 1, name: "Футбольная школа «Голеадор»", address: "ул. Абая 52", phone: "+7 777 123 4567", rating: 4.8, age: "5–12 лет", x: 35, y: 40 },
  { id: 2, name: "Студия «Кисточка»", address: "ул. Розыбакиева 78", phone: "+7 777 234 5678", rating: 4.9, age: "4–10 лет", x: 55, y: 30 },
  { id: 3, name: "Робототехника KidsTech", address: "пр. Аль-Фараби 15", phone: "+7 777 345 6789", rating: 4.7, age: "6–14 лет", x: 70, y: 55 },
  { id: 4, name: "Танцы «Ритм»", address: "ул. Тимирязева 42", phone: "+7 777 456 7890", rating: 4.6, age: "4–16 лет", x: 25, y: 65 },
  { id: 5, name: "Плавание «Дельфин»", address: "ул. Жандосова 98", phone: "+7 777 567 8901", rating: 4.5, age: "3–12 лет", x: 50, y: 70 },
];

const MapPage = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedClub = clubs.find((c) => c.id === selected);

  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-extrabold">📍 Карта кружков</h1>
        <p className="text-sm text-muted-foreground">Найдите кружки рядом с вами</p>
      </div>

      {/* Fake map */}
      <div className="mx-4 relative bg-green-light rounded-2xl h-72 overflow-hidden border border-border">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div key={`h${i}`} className="absolute w-full border-t border-primary/30" style={{ top: `${(i + 1) * 12.5}%` }} />
          ))}
          {[...Array(8)].map((_, i) => (
            <div key={`v${i}`} className="absolute h-full border-l border-primary/30" style={{ left: `${(i + 1) * 12.5}%` }} />
          ))}
        </div>

        {/* Markers */}
        {clubs.map((club) => (
          <button
            key={club.id}
            onClick={() => setSelected(club.id === selected ? null : club.id)}
            className={`absolute transition-all duration-200 ${
              selected === club.id ? "scale-125 z-10" : "hover:scale-110"
            }`}
            style={{ left: `${club.x}%`, top: `${club.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
              selected === club.id ? "bg-accent" : "bg-primary"
            }`}>
              <MapPin size={18} className="text-primary-foreground" />
            </div>
          </button>
        ))}

        <div className="absolute bottom-2 right-2 bg-card/90 rounded-lg px-2 py-1 text-[10px] font-bold text-muted-foreground">
          Алматы
        </div>
      </div>

      {/* Selected club card */}
      {selectedClub && (
        <div className="mx-4 mt-3 bg-card rounded-2xl p-4 shadow-md border border-border animate-slide-up">
          <h3 className="font-extrabold text-base">{selectedClub.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star size={14} className="text-secondary fill-secondary" />
            <span className="text-sm font-bold">{selectedClub.rating}</span>
            <span className="text-xs text-muted-foreground ml-2">Возраст: {selectedClub.age}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
            <MapPin size={14} />
            {selectedClub.address}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <Phone size={14} />
            {selectedClub.phone}
          </div>
          <button className="mt-3 w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl hover:bg-green-bright transition-colors">
            Подробнее
          </button>
        </div>
      )}

      {/* List */}
      <div className="px-4 mt-4">
        <h2 className="text-base font-extrabold mb-2">Все кружки</h2>
        <div className="flex flex-col gap-2">
          {clubs.map((club) => (
            <button
              key={club.id}
              onClick={() => setSelected(club.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                selected === club.id
                  ? "border-primary bg-green-light/50"
                  : "border-border bg-card"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{club.name}</p>
                <p className="text-xs text-muted-foreground">{club.address}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <Star size={12} className="text-secondary fill-secondary" />
                <span className="text-xs font-bold">{club.rating}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
