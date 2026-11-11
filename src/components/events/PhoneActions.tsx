import { Phone, MessageCircle } from "lucide-react";
import { normalizePhone, formatPhone } from "@/lib/phone";
import { useLanguage } from "@/hooks/useLanguage";

/** Normalises KZ numbers ("8 775…", "+7 707…") to 7XXXXXXXXXX for tel/wa links. */
export function phoneDigits(phone: string): string {
  return normalizePhone(phone) || "";
}

export default function PhoneActions({ phone }: { phone?: string | null }) {
  const { lang } = useLanguage();
  const d = normalizePhone(phone);
  if (!d) return null;
  const ui = { ru: ["Позвонить", "WhatsApp"], kz: ["Қоңырау шалу", "WhatsApp"], en: ["Call", "WhatsApp"] }[lang];
  return (
    <div className="mt-3 w-full">
      <p className="text-xs font-bold text-muted-foreground mb-1.5">{formatPhone(d)}</p>
      <div className="flex gap-2">
        <a href={`tel:+${d}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted border border-border text-xs font-black"><Phone size={14} /> {ui[0]}</a>
        <a href={`https://wa.me/${d}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black"><MessageCircle size={14} /> {ui[1]}</a>
      </div>
    </div>
  );
}
