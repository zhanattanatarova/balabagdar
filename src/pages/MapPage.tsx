import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Star, Phone, ExternalLink, Loader2, Navigation, Map as MapIcon, ArrowRight, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeUrl, safeImageUrl } from "@/lib/safeUrl";
import { useLanguage } from "@/hooks/useLanguage";

const mapStrings = {
  kz: { title: "🗺️ Үйірмелер картасы", geocoding: "геокодтау…", nearby: "Менің жанымда", profile: "Профиль", call: "Қоңырау", open_profile: "Профильді ашу", phone: "Қоңырау шалу", all_clubs: "Барлық үйірмелер", no_clubs: "Бұл қалада әзірге үйірмелер жоқ" },
  ru: { title: "🗺️ Карта кружков", geocoding: "геокодинг…", nearby: "Рядом со мной", profile: "Профиль", call: "Звонок", open_profile: "Открыть профиль", phone: "Позвонить", all_clubs: "Все кружки", no_clubs: "Пока нет кружков в этом городе" },
  en: { title: "🗺️ Clubs map", geocoding: "geocoding…", nearby: "Near me", profile: "Profile", call: "Call", open_profile: "Open profile", phone: "Call", all_clubs: "All clubs", no_clubs: "No clubs in this city yet" },
};

// Fix default marker icons (Vite asset URLs)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Club {
  id: string;
  name_ru: string;
  address: string | null;
  phone: string | null;
  rating: number | null;
  age_min: number | null;
  age_max: number | null;
  avatar_url: string | null;
  twogis_url?: string | null;
  city: string;
  lat?: number;
  lng?: number;
}

const CITY_CENTERS: Record<string, [number, number]> = {
  "Актау": [43.6532, 51.1973],
  "Алматы": [43.2389, 76.8897],
  "Астана": [51.1605, 71.4704],
  "Шымкент": [42.3417, 69.5901],
  "Жанаозен": [43.3406, 52.8597],
  "Караганда": [49.8047, 73.1094],
  "Актобе": [50.2839, 57.1660],
  "Атырау": [47.0945, 51.9238],
  "Тараз": [42.9000, 71.3667],
  "Павлодар": [52.2873, 76.9674],
  "Семей": [50.4111, 80.2275],
  "Костанай": [53.2198, 63.6354],
  "Кызылорда": [44.8488, 65.4823],
  "Уральск": [51.2333, 51.3667],
  "Петропавловск": [54.8657, 69.1387],
  "Темиртау": [50.0547, 72.9646],
  "Туркестан": [43.2974, 68.2517],
  "Кокшетау": [53.2858, 69.3954],
  "Талдыкорган": [45.0156, 78.3739],
  "Экибастуз": [51.7244, 75.3225],
  "Усть-Каменогорск": [49.9787, 82.6147],
};

const CITY_SLUG: Record<string, string> = {
  "Астана": "astana", "Алматы": "almaty", "Шымкент": "shymkent",
  "Актау": "aktau", "Жанаозен": "zhanaozen", "Караганда": "karaganda",
  "Актобе": "aktobe", "Атырау": "atyrau", "Тараз": "taraz",
  "Павлодар": "pavlodar", "Семей": "semey", "Костанай": "kostanay",
  "Кызылорда": "kyzylorda", "Уральск": "oral", "Петропавловск": "petropavl",
  "Темиртау": "temirtau", "Туркестан": "turkistan", "Кокшетау": "kokshetau",
  "Талдыкорган": "taldykorgan", "Экибастуз": "ekibastuz", "Усть-Каменогорск": "ust-kamenogorsk",
};

// Geocode using Nominatim with localStorage cache
async function geocode(query: string): Promise<[number, number] | null> {
  const key = `geo:${query}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch {}
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { "Accept-Language": "ru" } }
    );
    const data = await res.json();
    if (data?.[0]) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      try { localStorage.setItem(key, JSON.stringify(coords)); } catch {}
      return coords;
    }
  } catch {}
  return null;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [points, map]);
  return null;
}

const MapPage = ({ city }: { city: string }) => {
  const { lang } = useLanguage();
  const mt = mapStrings[lang] || mapStrings.kz;
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("clubs")
        .select("id,name_ru,address,phone,rating,age_min,age_max,avatar_url,twogis_url,city")
        .eq("is_active", true)
        .eq("city", city);
      const list = ((data as any) || []) as Club[];
      setClubs(list);
      setLoading(false);

      // Geocode addresses progressively
      setGeocoding(true);
      for (const club of list) {
        if (!club.address) continue;
        const coords = await geocode(`${club.address}, ${club.city}, Казахстан`);
        if (coords) {
          setClubs((prev) => prev.map((c) => (c.id === club.id ? { ...c, lat: coords[0], lng: coords[1] } : c)));
        }
        await new Promise((r) => setTimeout(r, 250)); // Nominatim rate limit ~1 req/s, be polite
      }
      setGeocoding(false);
    };
    load();
  }, [city]);

  const filteredClubs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter((c) =>
      (c.name_ru || "").toLowerCase().includes(q) ||
      (c.address || "").toLowerCase().includes(q)
    );
  }, [clubs, searchQuery]);
  const center = CITY_CENTERS[city] || [48.0196, 66.9237];
  const markers = useMemo(() => filteredClubs.filter((c) => c.lat && c.lng) as Required<Pick<Club, "lat" | "lng">> & Club[], [filteredClubs]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(p);
        mapRef.current?.setView(p, 14);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const cityGisUrl = `https://2gis.kz/${CITY_SLUG[city] || "astana"}`;

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-black">{mt.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold inline-flex items-center gap-1 text-muted-foreground">
              <MapPin size={12} /> {city}
            </span>
            {geocoding && (
              <span className="text-[10px] font-bold text-primary inline-flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" /> {mt.geocoding}
              </span>
            )}
          </div>
        </div>
        <a
          href={cityGisUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-black text-xs px-3 py-2 rounded-xl"
          style={{ boxShadow: "var(--shadow-cartoon)" }}
        >
          <ExternalLink size={12} /> 2GIS
        </a>
      </div>

      <div className="px-4 mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или адресу"
            className="w-full pl-9 pr-9 py-2 rounded-full text-xs font-bold bg-card border-[3px] border-foreground/8 focus:outline-none focus:border-primary"
            style={{ boxShadow: "var(--shadow-cartoon)" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center"
              aria-label="Очистить"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <button
          onClick={handleLocate}
          className="inline-flex items-center gap-2 bg-card border-[3px] border-foreground/8 font-black text-xs px-4 py-2 rounded-full shrink-0"
          style={{ boxShadow: "var(--shadow-cartoon)" }}
        >
          <Navigation size={14} /> {mt.nearby}
        </button>
      </div>

      <div
        className="mx-4 rounded-2xl overflow-hidden border-[3px] border-foreground/8 bg-muted"
        style={{ boxShadow: "var(--shadow-cartoon-lg)", height: "55vh", minHeight: 360 }}
      >
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          ref={(m) => {
            if (m) mapRef.current = m;
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((club) => (
            <Marker
              key={club.id}
              position={[club.lat!, club.lng!]}
              eventHandlers={{ click: () => setSelected(club.id) }}
            >
              <Popup>
                <div className="font-bold text-sm">{club.name_ru}</div>
                {club.address && <div className="text-xs opacity-70">{club.address}</div>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Link
                    to={`/club/${club.id}`}
                    className="text-[11px] font-black bg-primary text-primary-foreground px-2.5 py-1 rounded-lg inline-flex items-center gap-1"
                  >
                    {mt.profile} <ArrowRight size={10} />
                  </Link>
                  {club.phone && (
                    <a href={`tel:${club.phone}`} className="text-[11px] font-black bg-muted px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                      <Phone size={10} /> {mt.call}
                    </a>
                  )}
                  {safeImageUrl(club.twogis_url) && (
                    <a href={safeUrl(club.twogis_url)} target="_blank" rel="noopener noreferrer" className="text-[11px] font-black bg-muted px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                      <ExternalLink size={10} /> 2GIS
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          {userPos && (
            <Marker
              position={userPos}
              icon={L.divIcon({
                className: "",
                html: '<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 2px #3b82f6"></div>',
                iconSize: [18, 18],
              })}
            />
          )}
          <FitBounds points={markers.map((m) => [m.lat!, m.lng!])} />
        </MapContainer>
      </div>

      <div className="px-4 mt-5">
        <h2 className="section-title mb-3 flex items-center gap-2">
          <MapIcon size={16} /> {mt.all_clubs} — {city} ({clubs.length})
        </h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground font-bold">
            {mt.no_clubs}
          </div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {clubs.map((club) => (
              <div
                key={club.id}
                onClick={() => {
                  setSelected(club.id === selected ? null : club.id);
                  if (club.lat && club.lng) mapRef.current?.setView([club.lat, club.lng], 15);
                }}
                className={`p-3 rounded-2xl text-left transition-all border-[3px] cursor-pointer ${
                  selected === club.id ? "border-primary bg-yellow-light" : "border-foreground/8 bg-card"
                }`}
                style={{ boxShadow: "var(--shadow-cartoon)" }}
              >
                <div className="flex items-center gap-3">
                  {safeImageUrl(club.avatar_url) ? (
                    <img
                      src={safeImageUrl(club.avatar_url)}
                      alt=""
                      className="rounded-xl object-cover border-2 border-foreground/5"
                      style={{ width: 52, height: 52 }}
                    />
                  ) : (
                    <div
                      className="rounded-xl bg-muted flex items-center justify-center"
                      style={{ width: 52, height: 52 }}
                    >
                      <MapPin size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate">{club.name_ru}</p>
                    <p className="text-[10px] text-muted-foreground font-bold truncate">{club.address}</p>
                  </div>
                  {club.rating ? (
                    <div className="flex items-center gap-0.5 bg-yellow-light px-2 py-0.5 rounded-full shrink-0">
                      <Star size={10} className="text-primary fill-primary" />
                      <span className="text-xs font-black">{club.rating}</span>
                    </div>
                  ) : null}
                </div>
                {selected === club.id && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                    <Link
                      to={`/club/${club.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs font-black bg-primary text-primary-foreground px-3 py-2 rounded-xl"
                    >
                      {mt.open_profile} <ArrowRight size={12} />
                    </Link>
                    {club.phone && (
                      <a
                        href={`tel:${club.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs font-black bg-muted px-3 py-2 rounded-xl"
                      >
                        <Phone size={12} /> {mt.phone}
                      </a>
                    )}
                    {safeImageUrl(club.twogis_url) && (
                      <a
                        href={safeUrl(club.twogis_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs font-black bg-muted px-3 py-2 rounded-xl"
                      >
                        <ExternalLink size={12} /> 2GIS
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
