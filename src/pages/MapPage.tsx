import { MapPin, Star, Phone, Navigation } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
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
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-black">Карта кружков</h1>
        <p className="text-xs text-muted-foreground">Кружки рядом с вами</p>
      </div>

      <div className="mx-4 relative rounded-2xl h-64 overflow-hidden border border-border shadow-sm bg-yellow-light">
        <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 400 300">
          <path d="M0 150 Q100 120 200 150 Q300 180 400 140" stroke="hsl(45, 80%, 40%)" strokeWidth="3" fill="none"/>
          <path d="M150 0 Q170 100 160 200 Q150 250 180 300" stroke="hsl(45, 80%, 40%)" strokeWidth="3" fill="none"/>
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-3.5 h-3.5 rounded-full bg-accent border-2 border-card shadow-lg" />
          <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-accent animate-ping opacity-30" />
        </div>
        {clubs.map((club) => (
          <button key={club.id} onClick={() => setSelected(club.id === selected ? null : club.id)}
            className={`absolute transition-all duration-300 z-20 ${selected === club.id ? "scale-125" : "hover:scale-110"}`}
            style={{ left: `${club.x}%`, top: `${club.y}%`, transform: "translate(-50%, -100%)" }}>
            <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 shadow-md ${selected === club.id ? "border-accent" : "border-card"}`}>
              <img src={club.img} alt="" className="w-full h-full object-cover" />
            </div>
          </button>
        ))}
      </div>

      {selectedClub && (
        <div className="mx-4 mt-3 bg-card rounded-xl overflow-hidden shadow-sm border border-border animate-slide-up">
          <div className="flex gap-3 p-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <img src={selectedClub.img} alt={selectedClub.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 py-0.5">
              <h3 className="font-bold text-sm">{selectedClub.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={11} className="text-primary fill-primary" />
                <span className="text-xs font-bold">{selectedClub.rating}</span>
                <span className="text-[10px] text-muted-foreground ml-1">{selectedClub.age}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin size={10} />{selectedClub.address}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Phone size={10} />{selectedClub.phone}</p>
            </div>
          </div>
          <div className="flex gap-2 px-3 pb-3">
            <button onClick={() => toast({ title: selectedClub.name, description: "Открываем подробности..." })}
              className="flex-1 bg-primary text-primary-foreground font-bold text-sm py-2.5 rounded-xl active:scale-[0.97] transition-transform">Подробнее</button>
            <button className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs">
              <Navigation size={12} />{selectedClub.dist}
            </button>
          </div>
        </div>
      )}

      <div className="px-4 mt-5">
        <h2 className="section-title mb-3">Все кружки</h2>
        <div className="flex flex-col gap-2">
          {clubs.map((club) => (
            <button key={club.id} onClick={() => setSelected(club.id)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                selected === club.id ? "border-primary bg-yellow-light" : "border-border bg-card"}`}>
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <img src={club.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{club.name}</p>
                <p className="text-[10px] text-muted-foreground">{club.address}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="text-primary fill-primary" />
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
