import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SplashScreen from "./SplashScreen";
import HomePage from "./HomePage";
import MapPage from "./MapPage";
import NewsPage from "./NewsPage";
import BoardPage from "./BoardPage";
import ProfilePage from "./ProfilePage";
import NotificationsPage from "./NotificationsPage";
import ClubDashboard from "./ClubDashboard";
import ClubEditPage from "./ClubEditPage";
import BottomNav from "@/components/BottomNav";
import SEO from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";

const seoByPath: Record<string, { title: string; description: string; path: string; noindex?: boolean }> = {
  "/": {
    title: "BalaHub — балалар үйірмелері мен мамандар Қазақстанда",
    description: "Қазақстанның 35 қаласындағы балалар үйірмелері, секциялар мен мамандарды тауып, броньдаңыз.",
    path: "/",
  },
  "/map": {
    title: "Үйірмелер картасы — BalaHub",
    description: "Қалаңыздағы балалар үйірмелерін картадан тауып, жақын маңдағыларды көріңіз.",
    path: "/map",
  },
  "/news": {
    title: "Балаларға арналған іс-шаралар — BalaHub",
    description: "Қазақстандағы балаларға арналған жаңалықтар, мерекелер мен іс-шаралар.",
    path: "/news",
  },
  "/board": {
    title: "Хабарландыру тақтасы — BalaHub",
    description: "Жұмыс іздеу, маман керек, бала күтуші — балалар саласындағы хабарландырулар.",
    path: "/board",
  },
  "/profile": { title: "Профиль — BalaHub", description: "Жеке профиль және баптаулар.", path: "/profile" },
  "/notifications": { title: "Хабарламалар — BalaHub", description: "Жеке хабарламалар.", path: "/notifications", noindex: true },
  "/dashboard": { title: "Басқару панелі — BalaHub", description: "Үйірме иесіне арналған панель.", path: "/dashboard", noindex: true },
  "/club/edit": { title: "Үйірмені өңдеу — BalaHub", description: "Үйірме профилін өңдеу.", path: "/club/edit", noindex: true },
};

const Index = () => {
  const { lang } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const [city, setCity] = useState(() => {
    try { return localStorage.getItem("bb_city") || "Актау"; } catch { return "Актау"; }
  });
  const location = useLocation();

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Persist manual city selection
  useEffect(() => {
    try { localStorage.setItem("bb_city", city); } catch {}
  }, [city]);

  const renderPage = () => {
    switch (location.pathname) {
      case "/map": return <MapPage city={city} />;
      case "/news": return <NewsPage city={city} />;
      case "/board": return <BoardPage city={city} />;
      case "/profile": return <ProfilePage />;
      case "/notifications": return <NotificationsPage />;
      case "/dashboard": return <ClubDashboard />;
      case "/club/edit": return <ClubEditPage />;
      default: return <HomePage city={city} setCity={setCity} />;
    }
  };

  const seo = seoByPath[location.pathname] || seoByPath["/"];
  const localizedHomeSeo = lang === "ru"
    ? { title: "BalaHub — детские кружки и центры Казахстана", description: "Найдите и забронируйте детские кружки, секции и специалистов в 35 городах Казахстана." }
    : lang === "en"
      ? { title: "BalaHub — kids' clubs and centers in Kazakhstan", description: "Find and book kids' clubs, activities and specialists in 35 cities across Kazakhstan." }
      : { title: seo.title, description: seo.description };
  const activeSeo = location.pathname === "/" ? { ...seo, ...localizedHomeSeo } : seo;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={activeSeo.title} description={activeSeo.description} path={activeSeo.path} />
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {renderPage()}
      <BottomNav />
    </div>
  );
};

export default Index;
