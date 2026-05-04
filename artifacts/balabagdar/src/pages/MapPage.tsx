import { useEffect, useRef, useState } from "react";
import { Star, Phone, MapPin, ArrowRight, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import type { Map as LeafletMap } from "leaflet";

const CITY_COORDS: Record<string, { lat: number; lon: number; zoom: number }> = {
  "Алматы": { lat: 43.2220, lon: 76.8512, zoom: 13 },
  "Астана": { lat: 51.1801, lon: 71.4460, zoom: 13 },
  "Шымкент": { lat: 42.3417, lon: 69.5901, zoom: 13 },
  "Караганда": { lat: 49.8028, lon: 73.0870, zoom: 13 },
  "Актобе": { lat: 50.2839, lon: 57.1670, zoom: 13 },
  "Тараз": { lat: 42.9000, lon: 71.3667, zoom: 13 },
  "Павлодар": { lat: 52.2833, lon: 76.9667, zoom: 13 },
  "Усть-Каменогорск": { lat: 49.9667, lon: 82.6167, zoom: 13 },
  "Семей": { lat: 50.4111, lon: 80.2275, zoom: 13 },
  "Атырау": { lat: 47.1167, lon: 51.8833, zoom: 13 },
  "Костанай": { lat: 53.2144, lon: 63.6356, zoom: 13 },
  "Кызылорда": { lat: 44.8522, lon: 65.5093, zoom: 13 },
  "Уральск": { lat: 51.2333, lon: 51.3667, zoom: 13 },
  "Петропавловск": { lat: 54.8667, lon: 69.1333, zoom: 13 },
  "Актау": { lat: 43.6525, lon: 51.1575, zoom: 13 },
  "Темиртау": { lat: 50.0500, lon: 72.9667, zoom: 13 },
  "Туркестан": { lat: 43.3000, lon: 68.2667, zoom: 13 },
  "Кокшетау": { lat: 53.2833, lon: 69.4000, zoom: 13 },
  "Талдыкорган": { lat: 45.0000, lon: 78.3833, zoom: 13 },
  "Экибастуз": { lat: 51.7200, lon: 75.3200, zoom: 13 },
  "Рудный": { lat: 52.9667, lon: 63.1167, zoom: 13 },
  "Жезказган": { lat: 47.7833, lon: 67.7167, zoom: 13 },
  "Каскелен": { lat: 43.1956, lon: 76.6239, zoom: 13 },
  "Талгар": { lat: 43.3017, lon: 77.2444, zoom: 13 },
  "Конаев": { lat: 43.8531, lon: 77.0786, zoom: 13 },
  "Жанаозен": { lat: 43.3350, lon: 52.8589, zoom: 13 },
  "Байконур": { lat: 45.9646, lon: 63.3050, zoom: 13 },
  "Балхаш": { lat: 46.8481, lon: 74.9953, zoom: 13 },
  "Кентау": { lat: 43.5167, lon: 68.5000, zoom: 13 },
  "Сатпаев": { lat: 47.9050, lon: 67.5344, zoom: 13 },
  "Сарань": { lat: 49.8047, lon: 72.8461, zoom: 13 },
  "Щучинск": { lat: 52.9333, lon: 70.2000, zoom: 13 },
  "Риддер": { lat: 50.3500, lon: 83.5167, zoom: 13 },
  "Аксай": { lat: 51.1833, lon: 53.0000, zoom: 13 },
  "Степногорск": { lat: 52.3500, lon: 71.8833, zoom: 13 },
};

interface Club {
  id: string;
  nameRu?: string;
  name_ru?: string;
  address?: string;
  phone?: string;
  rating?: number | null;
  lat?: number | null;
  lng?: number | null;
}

interface MapPageProps {
  city?: string;
}

const MapPage = ({ city = "Астана" }: MapPageProps) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selected, setSelected] = useState<Club | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const coords = CITY_COORDS[city] ?? { lat: 51.1801, lon: 71.4460, zoom: 13 };
  const osmLink = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=${coords.zoom}/${coords.lat}/${coords.lon}`;

  useEffect(() => {
    api.clubs.list({ city }).then(setClubs).catch(() => {});
  }, [city]);

  useEffect(() => {
    if (!mapDivRef.current) return;

    import("leaflet").then((L) => {
      const leaflet = L.default ?? L;

      if (!mapDivRef.current) return;

      if (mapRef.current) {
        mapRef.current.flyTo([coords.lat, coords.lon], coords.zoom, { duration: 1 });
        return;
      }

      const map = leaflet.map(mapDivRef.current, {
        center: [coords.lat, coords.lon],
        zoom: coords.zoom,
        zoomControl: true,
        attributionControl: false,
      });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        })
        .addTo(map);

      leaflet
        .circleMarker([coords.lat, coords.lon], {
          radius: 10,
          color: "#22c55e",
          fillColor: "#22c55e",
          fillOpacity: 0.8,
          weight: 3,
        })
        .addTo(map)
        .bindTooltip(city, { permanent: false, direction: "top" });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([coords.lat, coords.lon], coords.zoom, { duration: 1 });
    }
  }, [city, coords.lat, coords.lon, coords.zoom]);

  useEffect(() => {
    if (!mapRef.current || clubs.length === 0) return;
    import("leaflet").then((L) => {
      const leaflet = L.default ?? L;
      clubs.forEach((club) => {
        if (!club.lat || !club.lng || !mapRef.current) return;
        const icon = leaflet.divIcon({
          className: "",
          html: `<div style="width:30px;height:30px;border-radius:10px;background:#22c55e;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:14px;">🏫</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });
        leaflet
          .marker([club.lat, club.lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(club.nameRu || club.name_ru || "Кружок");
      });
    });
  }, [clubs]);

  const clubName = (c: Club) => c.nameRu || c.name_ru || "Кружок";

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black">🗺️ Карта кружков</h1>
          <p className="text-xs text-muted-foreground font-bold flex items-center gap-1">
            <MapPin size={10} /> {city}
          </p>
        </div>
        <a
          href={osmLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-bold text-primary"
        >
          <ExternalLink size={11} /> Открыть карту
        </a>
      </div>

      <div
        className="mx-4 rounded-2xl overflow-hidden border-[3px] border-foreground/8"
        style={{ height: 320, boxShadow: "var(--shadow-cartoon-lg)" }}
      >
        <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {selected && (
        <div className="mx-4 mt-3 cartoon-card overflow-hidden animate-slide-up">
          <div className="flex gap-3 p-3 items-start">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 border-2 border-foreground/8">
              🏫
            </div>
            <div className="flex-1 py-0.5">
              <h3 className="font-black text-sm">{clubName(selected)}</h3>
              {selected.rating != null && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                    <Star size={11} className="text-primary fill-primary" />
                    <span className="text-xs font-black">{Number(selected.rating).toFixed(1)}</span>
                  </div>
                </div>
              )}
              {selected.address && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-bold">
                  <MapPin size={10} />{selected.address}
                </p>
              )}
              {selected.phone && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 font-bold">
                  <Phone size={10} />{selected.phone}
                </p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="text-muted-foreground text-lg leading-none px-1">×</button>
          </div>
          <div className="px-3 pb-3">
            <button
              onClick={() => navigate(`/club/${selected.id}`)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black text-sm py-3 rounded-xl cartoon-btn border-primary"
            >
              Подробнее <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {clubs.length === 0 ? (
        <div className="mx-4 mt-4 text-center py-8 text-muted-foreground text-sm font-bold cartoon-card">
          <div className="text-3xl mb-2">🔍</div>
          <p>Кружки в городе {city} ещё не добавлены</p>
          <p className="text-xs mt-1 opacity-70">Станьте первым — добавьте кружок!</p>
        </div>
      ) : (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-black mb-3">📋 Все кружки в {city}</h2>
          <div className="flex flex-col gap-2.5">
            {clubs.map((club) => (
              <button
                key={club.id}
                onClick={() => setSelected(selected?.id === club.id ? null : club)}
                className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.98] border-[3px] ${
                  selected?.id === club.id
                    ? "border-primary bg-primary/5"
                    : "border-foreground/8 bg-card"
                }`}
                style={{ boxShadow: "var(--shadow-cartoon)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 border-2 border-foreground/5">
                  🏫
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate">{clubName(club)}</p>
                  {club.address && (
                    <p className="text-[10px] text-muted-foreground font-bold truncate">
                      <MapPin size={9} className="inline mr-0.5" />{club.address}
                    </p>
                  )}
                </div>
                {club.rating != null && (
                  <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-0.5 rounded-full shrink-0">
                    <Star size={10} className="text-primary fill-primary" />
                    <span className="text-xs font-black">{Number(club.rating).toFixed(1)}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
