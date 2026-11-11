import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { hasPublishedArticles } from "@/lib/publicData";

const LINKS = [
  { to: "/collections", emoji: "✨", ru: "Подборки", kz: "Топтамалар", en: "Collections" },
  { to: "/holidays", emoji: "🏕️", ru: "Каникулы", kz: "Каникулдар", en: "Holidays" },
  { to: "/deals", emoji: "🏷️", ru: "Акции", kz: "Акциялар", en: "Deals" },
  { to: "/blog", emoji: "📖", ru: "Блог", kz: "Блог", en: "Blog", blog: true },
];

export default function SectionLinks() {
  const { lang } = useLanguage();
  const [blog, setBlog] = useState(false);
  useEffect(() => { hasPublishedArticles().then(setBlog); }, []);
  return (
    <nav aria-label="sections" className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {LINKS.filter((l) => !l.blog || blog).map((l) => (
        <Link key={l.to} to={l.to} className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-card border border-border text-xs font-black hover:border-primary">
          <span>{l.emoji}</span>{l[lang as "ru"] || l.ru}
        </Link>
      ))}
    </nav>
  );
}
