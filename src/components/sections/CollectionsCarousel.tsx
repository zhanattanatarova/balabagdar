import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useCityData, resolvedCollections } from "@/hooks/useCityData";
import { pick } from "@/lib/publicData";

export default function CollectionsCarousel() {
  const { lang } = useLanguage();
  const { loading, clubs, pubs, collections } = useCityData(true);
  const list = resolvedCollections(collections, clubs, pubs);
  if (loading || !list.length) return null;
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
      {list.map(({ c, clubs, pubs }) => (
        <Link key={c.id} to={`/collections/${c.slug}`} className="shrink-0 w-44 cartoon-card p-3 hover:bg-muted/40">
          <div className="text-3xl">{c.cover_emoji || "✨"}</div>
          <div className="font-black text-sm mt-1 leading-snug">{pick(c, "title", lang)}</div>
          <div className="text-[11px] font-bold text-muted-foreground mt-0.5">{clubs.length + pubs.length}</div>
        </Link>
      ))}
    </div>
  );
}
