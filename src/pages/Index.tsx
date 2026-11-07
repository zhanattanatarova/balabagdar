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

type L = { ru: string; kz: string; en: string };
const seoByPath: Record<string, { title: L; description: L; path: string }> = {
  "/clubs": {
    title: { ru: "BalaHub — детские кружки и центры Казахстана", kz: "BalaHub — балалар үйірмелері мен орталықтары", en: "BalaHub — kids' clubs and centers in Kazakhstan" },
    description: { ru: "Найдите детские кружки, секции и специалистов в 35 городах Казахстана.", kz: "Қазақстанның 35 қаласындағы балалар үйірмелері мен мамандарын табыңыз.", en: "Find kids' clubs, activities and specialists in 35 cities across Kazakhstan." },
    path: "/clubs",
  },
  "/map": {
    title: { ru: "Центры на карте — BalaHub", kz: "Орталықтар картада — BalaHub", en: "Centers on the map — BalaHub" },
    description: { ru: "Детские центры и кружки вашего города на карте.", kz: "Қалаңыздағы балалар орталықтары картада.", en: "Kids' centers and clubs in your city on the map." },
    path: "/map",
  },
  "/board": {
    title: { ru: "Доска объявлений — BalaHub", kz: "Хабарландыру тақтасы — BalaHub", en: "Notice board — BalaHub" },
    description: { ru: "Объявления детских центров и родителей: занятия, вакансии, услуги.", kz: "Балалар орталықтары мен ата-аналардың хабарландырулары.", en: "Announcements from kids' centers and parents." },
    path: "/board",
  },
  "/profile": { title: { ru: "Профиль — BalaHub", kz: "Профиль — BalaHub", en: "Profile — BalaHub" }, description: { ru: "Профиль и настройки.", kz: "Жеке профиль және баптаулар.", en: "Profile and settings." }, path: "/profile" },
  "/notifications": { title: { ru: "Уведомления — BalaHub", kz: "Хабарламалар — BalaHub", en: "Notifications — BalaHub" }, description: { ru: "Уведомления.", kz: "Хабарламалар.", en: "Notifications." }, path: "/notifications" },
  "/dashboard": { title: { ru: "Мой кабинет — BalaHub", kz: "Жеке кабинет — BalaHub", en: "My dashboard — BalaHub" }, description: { ru: "Кабинет центра.", kz: "Орталық кабинеті.", en: "Center dashboard." }, path: "/dashboard" },
  "/club/edit": { title: { ru: "Редактирование центра — BalaHub", kz: "Орталықты өңдеу — BalaHub", en: "Edit center — BalaHub" }, description: { ru: "Редактирование профиля центра.", kz: "Орталық профилін өңдеу.", en: "Edit center profile." }, path: "/club/edit" },
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
      case "/clubs": return <HomePage city={city} setCity={setCity} />;
      case "/board": return <BoardPage city={city} />;
      case "/profile": return <ProfilePage />;
      case "/notifications": return <NotificationsPage />;
      case "/dashboard": return <ClubDashboard />;
      case "/club/edit": return <ClubEditPage />;
      default: return <NewsPage city={city} setCity={setCity} />;
    }
  };

  const seo = seoByPath[location.pathname];
  const l = (lang as keyof L) in { ru: 1, kz: 1, en: 1 } ? (lang as keyof L) : "ru";

  return (
    <div className="min-h-screen bg-background">
      {seo && <SEO title={seo.title[l]} description={seo.description[l]} path={seo.path} />}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {renderPage()}
      <BottomNav />
    </div>
  );
};

export default Index;
