import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { formatTwoGisRating, hasTwoGisRating, twoGisReviewsLabel, twoGisReviewsUrl } from "@/lib/twogis";

interface Props {
  rating: number | string | null | undefined;
  count: number | null | undefined;
  /** When set, the badge links to the 2GIS reviews tab in a new tab. */
  url?: string | null;
  size?: "sm" | "md";
  className?: string;
}

/** External 2GIS rating, always labelled with its source. Never merged with BalaHub's own rating. */
const TwoGisBadge = ({ rating, count, url, size = "sm", className = "" }: Props) => {
  const { lang } = useLanguage();
  if (!hasTwoGisRating(rating)) return null;
  const text = `★ ${formatTwoGisRating(rating as number)} · ${twoGisReviewsLabel(count, lang as "ru" | "kz" | "en")}`;
  const cls = `inline-flex items-center gap-1 rounded-full bg-muted border border-border font-bold text-foreground ${
    size === "md" ? "text-xs px-2.5 py-1" : "text-[10px] px-1.5 py-0.5"
  } ${className}`;
  const href = url ? twoGisReviewsUrl(url) : null;
  const label = <span>{text}</span>;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:bg-muted/70`} title={text}>
        {label}
        <ExternalLink size={size === "md" ? 12 : 10} className="text-muted-foreground" />
      </a>
    );
  }
  return <span className={cls} title={text}>{label}</span>;
};

export default TwoGisBadge;
