import { useLanguage } from "@/hooks/useLanguage";
import { Lang } from "@/i18n/translations";

const flags: Record<Lang, string> = { ru: "🇷🇺", kz: "🇰🇿", en: "🇬🇧" };
const labels: Record<Lang, string> = { ru: "РУ", kz: "ҚЗ", en: "EN" };

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();
  const langs: Lang[] = ["kz", "ru", "en"];

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
