import { useLanguage } from "@/hooks/useLanguage";
import { Lang } from "@/i18n/translations";

const flags: Record<Lang, string> = { ru: "🇷🇺", kz: "🇰🇿", en: "🇬🇧" };
const labels: Record<Lang, string> = { ru: "РУ", kz: "ҚЗ", en: "EN" };

const LanguageSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { lang, setLang } = useLanguage();
  const langs: Lang[] = ["kz", "ru", "en"];

  if (compact) {
    return (
      <div className="flex items-center gap-0.5 bg-card/90 rounded-full p-0.5 border-2 border-primary/30" role="group" aria-label="Language">
        {langs.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`px-2 py-1 rounded-full text-[10px] font-black transition-all ${
              lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {labels[l]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{flags[l]}</span>
          <span>{labels[l]}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
