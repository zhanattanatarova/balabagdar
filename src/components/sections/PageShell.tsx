import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/hooks/useLanguage";

export default function PageShell({ title, subtitle, back = "/", children }: { title: string; subtitle?: string; back?: string; children: ReactNode }) {
  const { lang } = useLanguage();
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-4xl mx-auto px-4 pt-5">
        <Link to={back} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground mb-3"><ArrowLeft size={16} />{{ ru: "Назад", kz: "Артқа", en: "Back" }[lang]}</Link>
        <h1 className="text-2xl font-black">{title}</h1>
        {subtitle && <p className="text-sm font-bold text-muted-foreground mt-1">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
