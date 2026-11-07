import { Link } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";
import ClubInitialAvatar from "@/components/ClubInitialAvatar";
import PublicationSource from "@/components/PublicationSource";
import PhoneActions from "@/components/events/PhoneActions";
import { useLanguage } from "@/hooks/useLanguage";
import { clubAge } from "@/lib/clubDisplay";
import { formatEventDate } from "@/lib/events";
import type { Pub, PubClub } from "@/lib/publicData";

export function ClubMiniCard({ club }: { club: PubClub }) {
  const { lang, tField } = useLanguage();
  const name = tField(club.name_ru, club.name_kz, club.name_en);
  return (
    <Link to={`/club/${club.id}`} className="cartoon-card p-3 flex items-center gap-3 hover:bg-muted/40">
      {club.avatar_url ? <img src={club.avatar_url} alt={name} className="h-12 w-12 rounded-xl object-cover shrink-0" /> : <ClubInitialAvatar name={name} size="sm" className="shrink-0" />}
      <div className="min-w-0">
        <div className="font-black text-sm truncate">{name}</div>
        <div className="text-xs font-bold text-muted-foreground">{clubAge(club.age_min, club.age_max, lang)}</div>
      </div>
    </Link>
  );
}

export const AD_LABEL = { ru: "Реклама", kz: "Жарнама", en: "Ad" };
export const DEAL_UNTIL = { ru: "до", kz: "дейін", en: "until" };

export function PubCard({ pub }: { pub: Pub }) {
  const { lang } = useLanguage();
  const until = pub.deal_until ? new Date(`${pub.deal_until}T12:00:00Z`).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "long", timeZone: "UTC" }) : null;
  return (
    <div className="cartoon-card p-4">
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        {pub.is_promoted && <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-accent text-accent-foreground">{AD_LABEL[lang]}</span>}
        {pub.discount_text && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1"><Tag size={11} />{pub.discount_text}</span>}
        {pub.event_date && <span className="text-xs font-black text-primary flex items-center gap-1"><Calendar size={12} />{formatEventDate(pub.event_date, pub.event_end_date, lang)}</span>}
        {until && <span className="text-xs font-bold text-muted-foreground">{lang === "kz" ? `${until} ${DEAL_UNTIL.kz}` : `${DEAL_UNTIL[lang]} ${until}`}</span>}
      </div>
      <h3 className="font-black text-base leading-snug"><Link to={`/publication/${pub.id}`} className="hover:underline">{pub.title}</Link></h3>
      <p className="text-sm mt-1.5 line-clamp-4 whitespace-pre-line">{pub.body}</p>
      <PublicationSource label={pub.source_label} url={pub.source_url} />
      <PhoneActions phone={pub.public_phone} />
    </div>
  );
}
