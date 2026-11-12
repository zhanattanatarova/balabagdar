import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useCityData, resolvedCollections } from "@/hooks/useCityData";
import { pick } from "@/lib/publicData";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function CollectionsCarousel() {
  const { lang } = useLanguage();
  const { loading, clubs, pubs, collections } = useCityData(true);
  const list = resolvedCollections(collections, clubs, pubs);
  if (loading || !list.length) return null;
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
      {list.map(({ c, clubs, pubs }) => (
        <Link key={c.id} to={`/collections/${c.slug}`} className="shrink-0 flex items-center gap-3 w-56 rounded-lg border border-border p-3 hover:bg-muted/40">
          <Sparkles size={18} className="text-primary shrink-0" />
          <div className="font-semibold text-xs leading-snug flex-1">{pick(c, "title", lang)}<span className="block text-[11px] font-medium text-muted-foreground mt-1">{clubs.length + pubs.length}</span></div>
          <ArrowUpRight size={15} className="text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
}
