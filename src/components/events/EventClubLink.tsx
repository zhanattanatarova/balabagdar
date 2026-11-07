import { Link } from "react-router-dom";
import ClubInitialAvatar from "@/components/ClubInitialAvatar";
import { useLanguage } from "@/hooks/useLanguage";

export interface EventClub { id: string; name_ru: string; name_kz?: string | null; name_en?: string | null; avatar_url?: string | null }

export default function EventClubLink({ club }: { club?: EventClub | null }) {
  const { lang, tField } = useLanguage();
  if (!club) return null;
  const name = tField(club.name_ru, club.name_kz, club.name_en);
  const label = { ru: "О центре →", kz: "Орталық туралы →", en: "About center →" }[lang];
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl bg-muted p-2.5 border-2 border-border">
      {club.avatar_url
        ? <img src={club.avatar_url} alt={name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
        : <ClubInitialAvatar name={name} size="sm" className="shrink-0" />}
      <span className="flex-1 min-w-0 text-sm font-black truncate">{name}</span>
      <Link to={`/club/${club.id}`} className="shrink-0 text-xs font-black text-primary hover:underline">{label}</Link>
    </div>
  );
}
