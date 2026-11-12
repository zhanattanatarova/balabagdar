import { useLanguage } from "@/hooks/useLanguage";
import { Lang } from "@/i18n/translations";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const names: Record<Lang, string> = { ru: "Русский", kz: "Қазақша", en: "English" };

const flags: Record<Lang, string> = { ru: "🇷🇺", kz: "🇰🇿", en: "🇬🇧" };
const labels: Record<Lang, string> = { ru: "РУ", kz: "ҚЗ", en: "EN" };

const LanguageSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { lang, setLang } = useLanguage();
  const langs: Lang[] = ["kz", "ru", "en"];
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <div className="relative">
        <Button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Language"
          aria-expanded={open}
          variant="outline" size="sm" className="language-control text-xs font-semibold"
        >
          <Globe size={12} /> {labels[lang]}
        </Button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 z-50 bg-card rounded-2xl border border-border p-1 min-w-[120px]" style={{ boxShadow: "var(--shadow-cartoon)" }}>
              {langs.map((l) => (
                <Button
                  key={l}
                  type="button"
                  onClick={() => { setLang(l); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left ${lang === l ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <span>{flags[l]}</span><span>{names[l]}</span>
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
      {langs.map((l) => (
        <Button
          key={l}
          onClick={() => setLang(l)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{flags[l]}</span>
          <span>{labels[l]}</span>
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
