import { useLanguage } from "@/hooks/useLanguage";
import { safeUrl } from "@/lib/safeUrl";

export default function PublicationSource({ label, url }: { label?: string | null; url?: string | null }) {
  const { lang } = useLanguage();
  if (!label) return null;
  const prefix = { ru: "Источник", kz: "Дереккөз", en: "Source" }[lang];
  const href = safeUrl(url);
  return (
    <p className="mt-3 text-xs font-bold text-muted-foreground break-words">
      {prefix}: {href === "#" ? label : (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{label}</a>
      )}
    </p>
  );
}