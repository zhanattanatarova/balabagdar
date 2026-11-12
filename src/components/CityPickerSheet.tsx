import { useEffect, useState } from "react";
import { Search, MapPin, X, Check } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useEffect(() => { if (!open) setQuery(""); }, [open]);
  const filtered = CITIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));
  const close = () => { setQuery(""); onClose(); };

  return (
    <Dialog.Root open={open} onOpenChange={(value) => { if (!value) close(); }}>
      <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" />
      <Dialog.Content aria-describedby={undefined} className="fixed z-50 bottom-0 left-1/2 -translate-x-1/2 w-full sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] max-w-lg bg-card rounded-t-lg sm:rounded-lg shadow-xl max-h-[80dvh] flex flex-col border border-border p-4 gap-3">
        <div className="flex items-center justify-between gap-3">
          <Dialog.Title className="font-bold text-lg">{t("home.select_city")}</Dialog.Title>
          <Button variant="ghost" size="icon" onClick={close} aria-label={t("common.close")}><X size={18} /></Button>
        </div>
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("common.search_city")} aria-label={t("common.search_city")}
              className="pl-9 bg-muted" />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-1 pb-3">
          {filtered.map((c) => (
            <Button variant="ghost" key={c} onClick={() => { onSelect(c); close(); }} aria-pressed={c === city}
              className={`w-full justify-start gap-3 h-11 px-3 text-left ${c === city ? "bg-accent border border-primary" : "border border-transparent"}`}>
              <MapPin size={16} className={c === city ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-sm ${c === city ? "font-black text-foreground" : "font-bold"}`}>{c}</span>
              {c === city && <Check size={16} className="text-primary ml-auto" />}
            </Button>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">{t("home.not_found")}</p>}
        </div>
      </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CityPickerSheet;
