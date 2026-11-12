import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MapPin, ChevronDown, Plus, User } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CityPickerSheet from "@/components/CityPickerSheet";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useSelectedCity } from "@/hooks/useSelectedCity";

export default function SiteHeader() {
  const { t, lang } = useLanguage();
  const { pathname } = useLocation();
  const [city, setCity] = useSelectedCity();
  const [open, setOpen] = useState(false);
  const links = [{ to: "/clubs", label: t("nav.home") }, { to: "/map", label: t("nav.map") }, { to: "/", label: t("nav.events") }, { to: "/collections", label: lang === "ru" ? "Подборки" : lang === "kz" ? "Топтамалар" : "Collections" }, { to: "/board", label: t("nav.board") }];
  return <header className="site-header">
    <div className="site-header-inner">
      <Link to="/" className="flex items-center shrink-0" aria-label="BalaHub"><BrandLogo size="sm" framed={false} className="h-auto w-28 sm:w-32" /></Link>
      <nav className="hidden lg:flex items-center gap-5 xl:gap-7">{links.map(l => <Link key={l.to} to={l.to} aria-current={pathname === l.to ? "page" : undefined} className={`text-xs font-semibold whitespace-nowrap transition-colors hover:text-primary ${pathname === l.to ? "text-primary" : "text-foreground"}`}>{l.label}</Link>)}</nav>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="city-control"><MapPin /><span>{city}</span><ChevronDown /></Button>
        <LanguageSwitcher compact />
        <Button asChild variant="ghost" size="icon" className="lg:hidden" aria-label={t("nav.profile")}><Link to="/profile"><User /></Link></Button>
        <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex"><Link to="/profile">{t("nav.profile")}</Link></Button>
        <Button asChild size="sm" className="hidden xl:inline-flex"><Link to="/dashboard"><Plus />{lang === "ru" ? "Добавить центр" : lang === "kz" ? "Орталық қосу" : "Add center"}</Link></Button>
      </div>
    </div>
    <CityPickerSheet open={open} city={city} onClose={() => setOpen(false)} onSelect={setCity} />
  </header>;
}