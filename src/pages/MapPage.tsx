import { useEffect, useState } from "react";
import { MapPin, Star, Phone, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
}

const MapPage = ({ city }: { city: string }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("clubs")
        .select("id,name_ru,address,phone,rating,age_min,age_max,avatar_url,twogis_url,city")
        .eq("is_active", true)
        .eq("city", city);
      setClubs((data as any) || []);
      setLoading(false);
    };
    load();
  }, [city]);

  // 2GIS widget URL — works without API key
  const cityForGis = city.toLowerCase()
    .replace("астана", "astana")
    .replace("алматы", "almaty")
    .replace("шымкент", "shymkent")
    .replace("актау", "aktau")
    .replace("жанаозен", "zhanaozen")
    .replace("караганда", "karaganda")
    .replace("актобе", "aktobe")
    .replace("атырау", "atyrau")
    .replace("тараз", "taraz")
    .replace("павлодар", "pavlodar")
    .replace("семей", "semey")
    .replace("костанай", "kostanay")
    .replace("кызылорда", "kyzylorda")
    .replace("уральск", "oral")
    .replace("петропавловск", "petropavl")
    .replace("темиртау", "temirtau")
    .replace("туркестан", "turkistan")
    .replace("кокшетау", "kokshetau")
    .replace("талдыкорган", "taldykorgan")
    .replace("экибастуз", "ekibastuz")
    .replace("усть-каменогорск", "ust-kamenogorsk");

  const mapSrc = `https://2gis.kz/${cityForGis}?utm_source=balabagdar`;

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-black">🗺️ Карта кружков</h1>
        <p className="text-xs text-muted-foreground font-bold">{city} · {clubs.length} кружков</p>
      </div>

      <div className="mx-4 rounded-2xl overflow-hidden border-[3px] border-foreground/8 bg-muted" style={{ boxShadow: "var(--shadow-cartoon-lg)" }}>
        <iframe
          title="2GIS"
          src={mapSrc}
          className="w-full"
          style={{ height: "55vh", minHeight: 320, border: 0 }}
          loading="lazy"
        />
      </div>

      <div className="px-4 mt-5">
        <h2 className="section-title mb-3">📋 Все кружки в {city}</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground font-bold">
            Пока нет кружков в этом городе
          </div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {clubs.map((club) => (
              <div key={club.id}
                onClick={() => setSelected(club.id === selected ? null : club.id)}
                className={`p-3 rounded-2xl text-left transition-all border-[3px] cursor-pointer ${
                  selected === club.id ? "border-primary bg-yellow-light" : "border-foreground/8 bg-card"}`}
                style={{ boxShadow: "var(--shadow-cartoon)" }}>
                <div className="flex items-center gap-3">
                  {club.avatar_url ? (
                    <img src={club.avatar_url} alt="" className="w-13 h-13 rounded-xl object-cover border-2 border-foreground/5" style={{ width: 52, height: 52 }} />
                  ) : (
                    <div className="rounded-xl bg-muted flex items-center justify-center" style={{ width: 52, height: 52 }}>
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
                    {club.phone && (
                      <a href={`tel:${club.phone}`} className="flex items-center gap-1 text-xs font-black bg-primary text-primary-foreground px-3 py-2 rounded-xl">
                        <Phone size={12} /> Позвонить
                      </a>
                    )}
                    {club.twogis_url && (
                      <a href={club.twogis_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-black bg-muted px-3 py-2 rounded-xl">
                        <ExternalLink size={12} /> Открыть в 2GIS
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
