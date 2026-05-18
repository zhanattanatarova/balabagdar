import { useEffect, useRef, useState, useCallback } from "react";
import { Star, MapPin, ArrowRight, ExternalLink, Loader2, Navigation, LocateFixed } from "lucide-react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import type { Map as LeafletMap, Marker } from "leaflet";

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
};

interface Club {
  id: string;
  nameRu?: string; name_ru?: string;
  nameKz?: string; name_kz?: string;
  nameEn?: string; name_en?: string;
  address?: string;
  city?: string;
  phone?: string;
  rating?: number | null;
  avatarUrl?: string; avatar_url?: string;
  gisUrl?: string; gis_url?: string;
  category?: string;
}

interface MapPageProps { city?: string; }

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}

async function geocodeAddress(address: string, city: string): Promise<{ lat: number; lon: number } | null> {
  const query = `${address}, ${city}, Казахстан`;
  const cached = sessionStorage.getItem(`geo:${query}`);
  if (cached) return JSON.parse(cached);
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=kz`;
    const resp = await fetch(url, { headers: { "Accept-Language": "ru" } });
    const data = await resp.json();
    if (data?.[0]) {
      const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      sessionStorage.setItem(`geo:${query}`, JSON.stringify(result));
      return result;
    }
  } catch {}
  return null;
}

function open2gis(club: Club) {
  const gisUrl = club.gisUrl || club.gis_url;
  if (gisUrl) { window.open(gisUrl, "_blank", "noopener"); return; }
  const name = club.nameRu || club.name_ru || club.nameKz || club.name_kz || "";
  const q = [name, club.address, club.city].filter(Boolean).join(" ");
  window.open(`https://2gis.kz/search/${encodeURIComponent(q)}`, "_blank", "noopener");
}

const CATEGORY_EMOJI: Record<string, string> = {
  sport: "⚽", dance: "💃", music: "🎵", creativity: "🎨",
  languages: "🌍", tutors: "📚", robotics: "🤖", swim: "🏊",
  development: "🧠", speech: "🗣️", health: "❤️", special: "⭐",
  kindergarten: "🏠", other: "✨",
};

const NEARBY_RADIUS_KM = 5;

const MapPage = ({ city = "Астана" }: MapPageProps) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [geocoded, setGeocoded] = useState<Record<string, { lat: number; lon: number }>>({});
  const [selected, setSelected] = useState<Club | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // Геолокация
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);

  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { tField } = useLanguage();

  const cityCoords = CITY_COORDS[city] ?? { lat: 51.1801, lon: 71.4460, zoom: 13 };

  const clubName = (c: Club) =>
    tField(c.nameRu || c.name_ru, c.nameKz || c.name_kz, c.nameEn || c.name_en) || "Кружок";

  // Расстояние от пользователя до клуба
  const distanceTo = useCallback((club: Club): number | null => {
    if (!userLocation) return null;
    const gc = geocoded[club.id];
    if (!gc) return null;
    return haversine(userLocation.lat, userLocation.lon, gc.lat, gc.lon);
  }, [userLocation, geocoded]);

  // Загрузка кружков
  useEffect(() => {
    api.clubs.list({ city }).then(setClubs).catch(() => {});
  }, [city]);

  // Геокодинг адресов
  useEffect(() => {
    if (clubs.length === 0) return;
    const toGeocode = clubs.filter((c) => c.address && !geocoded[c.id]);
    if (toGeocode.length === 0) return;
    setGeocoding(true);
    let cancelled = false;
    const run = async () => {
      for (const club of toGeocode) {
        if (cancelled) break;
        const result = await geocodeAddress(club.address!, club.city || city);
        if (result && !cancelled) setGeocoded((prev) => ({ ...prev, [club.id]: result }));
        await new Promise((r) => setTimeout(r, 1100));
      }
      if (!cancelled) setGeocoding(false);
    };
    run();
    return () => { cancelled = true; };
  }, [clubs, city]);

  // Инициализация карты
  useEffect(() => {
    if (!mapDivRef.current) return;
    import("leaflet").then((L) => {
      const leaflet = L.default ?? L;
      if (!mapDivRef.current || mapRef.current) return;
      const map = leaflet.map(mapDivRef.current, {
        center: [cityCoords.lat, cityCoords.lon],
        zoom: cityCoords.zoom,
        zoomControl: false,
        attributionControl: false,
      });
      leaflet.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19, subdomains: "abcd",
      }).addTo(map);
      leaflet.control.zoom({ position: "bottomright" }).addTo(map);
      mapRef.current = map;
    });
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Полёт к городу
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([cityCoords.lat, cityCoords.lon], cityCoords.zoom, { duration: 0.8 });
    }
  }, [city, cityCoords.lat, cityCoords.lon, cityCoords.zoom]);

  // Маркер пользователя
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;
    import("leaflet").then((L) => {
      const leaflet = L.default ?? L;
      userMarkerRef.current?.remove();
      const icon = leaflet.divIcon({
        className: "",
        html: `<div style="
          width:18px;height:18px;border-radius:50%;
          background:#3b82f6;border:3px solid white;
          box-shadow:0 0 0 4px rgba(59,130,246,.3);
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      userMarkerRef.current = leaflet.marker([userLocation.lat, userLocation.lon], { icon })
        .addTo(mapRef.current!)
        .bindPopup("Вы здесь");
    });
  }, [userLocation]);

  // Маркеры кружков
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      const leaflet = L.default ?? L;
      if (!mapRef.current) return;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      clubs.forEach((club) => {
        const gc = geocoded[club.id];
        if (!gc || !mapRef.current) return;
        const emoji = CATEGORY_EMOJI[club.category || "other"] || "✨";
        const isSelected = selected?.id === club.id;
        const dist = distanceTo(club);
        const isNear = nearbyMode ? (dist !== null && dist <= NEARBY_RADIUS_KM) : true;
        if (nearbyMode && !isNear) return;
        const icon = leaflet.divIcon({
          className: "",
          html: `<div style="
            width:36px;height:36px;border-radius:12px;
            background:${isSelected ? "#16a34a" : "white"};
            border:3px solid ${isSelected ? "#166534" : "#22c55e"};
            box-shadow:0 3px 10px rgba(0,0,0,.25);
            display:flex;align-items:center;justify-content:center;
            font-size:18px;cursor:pointer;
            transform:${isSelected ? "scale(1.2)" : "scale(1)"};
            transition:all .2s;
          ">${emoji}</div>`,
          iconSize: [36, 36], iconAnchor: [18, 36],
        });
        const marker = leaflet.marker([gc.lat, gc.lon], { icon })
          .addTo(mapRef.current!)
          .on("click", () => {
            setSelected((prev) => (prev?.id === club.id ? null : club));
            mapRef.current?.flyTo([gc.lat, gc.lon], 16, { duration: 0.5 });
          });
        markersRef.current.push(marker);
      });
    });
  }, [clubs, geocoded, selected?.id, nearbyMode, distanceTo]);

  // Кнопка "Рядом" — запрос геолокации
  const handleNearby = () => {
    if (nearbyMode) {
      setNearbyMode(false);
      setLocationError(null);
      return;
    }
    if (userLocation) {
      setNearbyMode(true);
      mapRef.current?.flyTo([userLocation.lat, userLocation.lon], 15, { duration: 0.8 });
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("Геолокация не поддерживается браузером");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserLocation(loc);
        setNearbyMode(true);
        setLocating(false);
        mapRef.current?.flyTo([loc.lat, loc.lon], 15, { duration: 0.8 });
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocationError("Разрешите доступ к геолокации в настройках браузера");
        else setLocationError("Не удалось определить местоположение");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectClub = useCallback((club: Club) => {
    setSelected((prev) => (prev?.id === club.id ? null : club));
    const gc = geocoded[club.id];
    if (gc && mapRef.current) mapRef.current.flyTo([gc.lat, gc.lon], 16, { duration: 0.6 });
  }, [geocoded]);

  // Список кружков: в режиме рядом — фильтруем и сортируем по расстоянию
  const displayedClubs = (() => {
    if (!nearbyMode || !userLocation) return clubs;
    return clubs
      .map((c) => ({ club: c, dist: distanceTo(c) }))
      .filter(({ dist }) => dist !== null && dist <= NEARBY_RADIUS_KM)
      .sort((a, b) => (a.dist ?? 999) - (b.dist ?? 999))
      .map(({ club }) => club);
  })();

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black">🗺️ Карта кружков</h1>
          <p className="text-xs text-muted-foreground font-bold flex items-center gap-1">
            <MapPin size={10} /> {city}
            {geocoding && (
              <span className="flex items-center gap-1 text-primary ml-2">
                <Loader2 size={10} className="animate-spin" /> геокодинг...
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            const q = encodeURIComponent(`кружки для детей ${city}`);
            window.open(`https://2gis.kz/search/${q}`, "_blank", "noopener");
          }}
          className="flex items-center gap-1.5 text-xs font-black text-white bg-emerald-600 px-3 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <ExternalLink size={13} /> 2GIS
        </button>
      </div>

      {/* Фильтр "Рядом" */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <button
          onClick={handleNearby}
          disabled={locating}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-black transition-all active:scale-[0.97] border-2 ${
            nearbyMode
              ? "bg-blue-500 border-blue-600 text-white shadow-md"
              : "bg-card border-foreground/10 text-foreground hover:border-blue-400"
          }`}
        >
          {locating
            ? <Loader2 size={15} className="animate-spin" />
            : <LocateFixed size={15} />
          }
          {nearbyMode ? `Рядом (до ${NEARBY_RADIUS_KM} км)` : "Рядом со мной"}
        </button>
        {nearbyMode && (
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
            {displayedClubs.length} найдено
          </span>
        )}
        {locationError && (
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-xl border border-red-200 flex-1">
            {locationError}
          </span>
        )}
      </div>

      {/* Карта */}
      <div
        className="mx-4 rounded-2xl overflow-hidden border-[3px] border-foreground/8"
        style={{ height: 300, boxShadow: "var(--shadow-cartoon-lg)" }}
      >
        <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Легенда */}
      <div className="mx-4 mt-2 flex items-center gap-3 text-[10px] text-muted-foreground font-bold flex-wrap">
        <span>🟢 Кружок на карте</span>
        {userLocation && <span className="text-blue-600">🔵 Вы здесь</span>}
        {geocoding && <span className="text-primary">⏳ Определяю адреса...</span>}
        {!geocoding && Object.keys(geocoded).length > 0 && (
          <span className="text-primary">✅ {Object.keys(geocoded).length} из {clubs.filter(c => c.address).length} на карте</span>
        )}
      </div>

      {/* Попап выбранного клуба */}
      {selected && (
        <div className="mx-4 mt-3 cartoon-card overflow-hidden animate-slide-up">
          <div className="flex gap-3 p-3 items-start">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 border-foreground/8 bg-primary/10 flex items-center justify-center text-2xl">
              {selected.avatarUrl || selected.avatar_url
                ? <img src={selected.avatarUrl || selected.avatar_url} alt="" className="w-full h-full object-cover" />
                : CATEGORY_EMOJI[selected.category || "other"] || "🏫"
              }
            </div>
            <div className="flex-1 py-0.5 min-w-0">
              <h3 className="font-black text-sm truncate">{clubName(selected)}</h3>
              {(() => {
                const d = distanceTo(selected);
                return d !== null ? (
                  <p className="text-[10px] font-black text-blue-600 flex items-center gap-0.5">
                    <LocateFixed size={9} /> {formatDist(d)} от вас
                  </p>
                ) : null;
              })()}
              {selected.rating != null && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={11} className="text-secondary fill-secondary" />
                  <span className="text-xs font-black">{Number(selected.rating).toFixed(1)}</span>
                </div>
              )}
              {selected.address && (
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 font-bold truncate">
                  <MapPin size={9} />{selected.address}
                </p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="text-muted-foreground text-xl leading-none px-1 shrink-0">×</button>
          </div>
          <div className="px-3 pb-3 flex gap-2">
            <button
              onClick={() => open2gis(selected)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-black text-xs py-2.5 rounded-xl"
            >
              <Navigation size={13} /> В 2GIS
            </button>
            <button
              onClick={() => navigate(`/club/${selected.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-black text-xs py-2.5 rounded-xl"
            >
              Подробнее <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Список кружков */}
      <div className="px-4 mt-4">
        {nearbyMode && displayedClubs.length === 0 ? (
          <div className="text-center py-8 cartoon-card">
            <div className="text-3xl mb-2">📍</div>
            <p className="font-black text-sm">Рядом кружков не найдено</p>
            <p className="text-xs text-muted-foreground mt-1">
              В радиусе {NEARBY_RADIUS_KM} км нет кружков с известными адресами
            </p>
            <button onClick={() => setNearbyMode(false)} className="mt-3 text-xs font-black text-primary underline">
              Показать все
            </button>
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm font-bold cartoon-card">
            <div className="text-3xl mb-2">🔍</div>
            <p>Кружки в городе {city} ещё не добавлены</p>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-black mb-3">
              {nearbyMode
                ? `📍 Рядом с вами — ${displayedClubs.length} кружков`
                : `📋 Все кружки — ${city} (${clubs.length})`
              }
            </h2>
            <div className="flex flex-col gap-2">
              {displayedClubs.map((club) => {
                const isSelected = selected?.id === club.id;
                const hasCoords = !!geocoded[club.id];
                const hasGis = !!(club.gisUrl || club.gis_url);
                const emoji = CATEGORY_EMOJI[club.category || "other"] || "✨";
                const dist = distanceTo(club);
                return (
                  <div
                    key={club.id}
                    onClick={() => handleSelectClub(club)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectClub(club)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.98] border-[3px] cursor-pointer ${
                      isSelected ? "border-primary bg-primary/5" : "border-foreground/8 bg-card"
                    }`}
                    style={{ boxShadow: "var(--shadow-cartoon)" }}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 border-foreground/5 bg-primary/10 flex items-center justify-center text-xl">
                      {club.avatarUrl || club.avatar_url
                        ? <img src={club.avatarUrl || club.avatar_url} alt="" className="w-full h-full object-cover" />
                        : emoji
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{clubName(club)}</p>
                      {club.address && (
                        <p className="text-[10px] text-muted-foreground font-bold truncate flex items-center gap-0.5">
                          <MapPin size={9} className="shrink-0" />{club.address}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {dist !== null && (
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <LocateFixed size={8} /> {formatDist(dist)}
                          </span>
                        )}
                        {hasCoords && dist === null && (
                          <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">📍 На карте</span>
                        )}
                        {hasGis && (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">2GIS</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {club.rating != null && (
                        <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-0.5 rounded-full">
                          <Star size={10} className="text-secondary fill-secondary" />
                          <span className="text-xs font-black">{Number(club.rating).toFixed(1)}</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); open2gis(club); }}
                        className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg"
                      >
                        <Navigation size={10} /> 2GIS
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MapPage;
