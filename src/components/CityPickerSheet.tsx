import { useState } from "react";
import { Search, MapPin, X, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { CITIES } from "@/lib/cities";

interface Props {
  open: boolean;
  city: string;
  onClose: () => void;
  onSelect: (city: string) => void;
}

const CityPickerSheet = ({ open, city, onClose, onSelect }: Props) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  if (!open) return null;
  const filtered = CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()));
  const close = () => { setQuery(""); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up max-h-[75vh] flex flex-col border-t-[4px] border-x-[4px] border-primary">
        <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
        <div className="px-5 pb-3 flex items-center justify-between">
          <h3 className="font-black text-lg">🏙️ {t("home.select_city")}</h3>
          <button onClick={close} aria-label={t("common.close")} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
            <X size={16} className="text-destructive" />
          </button>
        </div>
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("common.search_city")}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-[3px] focus:ring-primary border-2 border-border" autoFocus />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-8">
          {filtered.map((c) => (
            <button key={c} onClick={() => { onSelect(c); close(); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${c === city ? "bg-primary/15 border-2 border-primary" : "hover:bg-muted border-2 border-transparent"}`}>
              <MapPin size={16} className={c === city ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-sm ${c === city ? "font-black text-foreground" : "font-bold"}`}>{c}</span>
              {c === city && <Check size={16} className="text-primary ml-auto" />}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-8 font-bold">😕 {t("home.not_found")}</p>}
        </div>
      </div>
    </div>
  );
};

export default CityPickerSheet;
