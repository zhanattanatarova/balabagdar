import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import SEO from "@/components/SEO";
import BrandLogo from "@/components/BrandLogo";

const UI = {
  ru: { title: "Страница не найдена", text: "Возможно, ссылка устарела или в адресе опечатка.", home: "На главную", clubs: "Смотреть кружки" },
  kz: { title: "Бет табылмады", text: "Сілтеме ескірген немесе мекенжайда қате болуы мүмкін.", home: "Басты бетке", clubs: "Үйірмелерді көру" },
  en: { title: "Page not found", text: "The link may be outdated or the address has a typo.", home: "Go home", clubs: "Browse clubs" },
};

const NotFound = () => {
  const { lang } = useLanguage();
  const ui = UI[lang] || UI.ru;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SEO title={`404 — ${ui.title} | BalaHub`} description={ui.text} path="/404" />
      <div className="cartoon-card p-8 text-center max-w-sm w-full">
        <div className="flex justify-center mb-3"><BrandLogo size="sm" /></div>
        <p className="text-6xl font-black text-primary">404</p>
        <h1 className="text-xl font-black mt-2">{ui.title}</h1>
        <p className="text-sm text-muted-foreground font-bold mt-2">{ui.text}</p>
        <div className="flex flex-col gap-2 mt-5">
          <Link to="/" className="py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm">{ui.home}</Link>
          <Link to="/clubs" className="py-3 rounded-2xl bg-muted font-black text-sm">{ui.clubs}</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
