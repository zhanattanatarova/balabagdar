import { useState, useCallback } from "react";
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

const seoByPath: Record<string, { title: string; description: string; path: string; noindex?: boolean }> = {
  "/": {
    title: "BalaBagdar — балалар үйірмелері мен мамандар Қазақстанда",
    description: "Қазақстанның 35 қаласындағы балалар үйірмелері, секциялар мен мамандарды тауып, броньдаңыз.",
    path: "/",
  },
  "/map": {
    title: "Үйірмелер картасы — BalaBagdar",
    description: "Қалаңыздағы балалар үйірмелерін картадан тауып, жақын маңдағыларды көріңіз.",
    path: "/map",
  },
  "/news": {
    title: "Балаларға арналған іс-шаралар — BalaBagdar",
    description: "Қазақстандағы балаларға арналған жаңалықтар, мерекелер мен іс-шаралар.",
    path: "/news",
  },
  "/board": {
    title: "Хабарландыру тақтасы — BalaBagdar",
    description: "Жұмыс іздеу, маман керек, бала күтуші — балалар саласындағы хабарландырулар.",
    path: "/board",
  },
  "/profile": { title: "Профиль — BalaBagdar", description: "Жеке профиль және баптаулар.", path: "/profile" },
  "/notifications": { title: "Хабарламалар — BalaBagdar", description: "Жеке хабарламалар.", path: "/notifications", noindex: true },
  "/dashboard": { title: "Басқару панелі — BalaBagdar", description: "Үйірме иесіне арналған панель.", path: "/dashboard", noindex: true },
  "/club/edit": { title: "Үйірмені өңдеу — BalaBagdar", description: "Үйірме профилін өңдеу.", path: "/club/edit", noindex: true },
};

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [city, setCity] = useState("Актау");
  const location = useLocation();

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <SEO title={seo.title} description={seo.description} path={seo.path} />
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {renderPage()}
      <BottomNav />
    </div>
  );
};

export default Index;
