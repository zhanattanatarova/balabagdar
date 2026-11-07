import { Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

/** Normalises KZ numbers ("8 775…", "+7 707…") to 7XXXXXXXXXX for tel/wa links. */
export function phoneDigits(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("8")) d = "7" + d.slice(1);
  if (d.length === 10) d = "7" + d;
  return d;
}

export default function PhoneActions({ phone }: { phone?: string | null }) {
  const { lang } = useLanguage();
  if (!phone) return null;
  const d = phoneDigits(phone);
  const ui = { ru: ["Позвонить", "WhatsApp"], kz: ["Қоңырау шалу", "WhatsApp"], en: ["Call", "WhatsApp"] }[lang];
  return (
    <div className="mt-3 w-full">
      <p className="text-xs font-bold text-muted-foreground mb-1.5">{phone}</p>
      <div className="flex gap-2">
        <a href={`tel:+${d}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted border-2 border-border text-xs font-black"><Phone size={14} /> {ui[0]}</a>
        <a href={`https://wa.me/${d}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black"><MessageCircle size={14} /> {ui[1]}</a>
      </div>
    </div>
  );
}
