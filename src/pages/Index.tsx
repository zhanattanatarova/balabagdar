import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

const KZ_CITIES = [
  "Алматы","Астана","Шымкент","Караганда","Актобе","Тараз","Павлодар","Усть-Каменогорск","Семей","Атырау",
  "Костанай","Кызылорда","Уральск","Петропавловск","Актау","Темиртау","Туркестан","Кокшетау","Талдыкорган","Экибастуз",
  "Рудный","Жезказган","Каскелен","Талгар","Конаев","Жанаозен","Байконур","Балхаш","Кентау","Сатпаев",
  "Сарань","Щучинск","Риддер","Аксай","Степногорск",
];

const CITY_ALIASES: Record<string, string> = {
  "almaty": "Алматы", "alma-ata": "Алматы",
  "astana": "Астана", "nur-sultan": "Астана", "nursultan": "Астана",
  "shymkent": "Шымкент", "chimkent": "Шымкент",
  "karaganda": "Караганда", "qaraghandy": "Караганда",
  "aktobe": "Актобе", "aqtobe": "Актобе",
  "taraz": "Тараз",
  "pavlodar": "Павлодар",
  "ust-kamenogorsk": "Усть-Каменогорск", "oskemen": "Усть-Каменогорск",
  "semey": "Семей", "semipalatinsk": "Семей",
  "atyrau": "Атырау",
  "kostanay": "Костанай", "qostanay": "Костанай",
  "kyzylorda": "Кызылорда", "qyzylorda": "Кызылорда",
  "uralsk": "Уральск", "oral": "Уральск",
  "petropavl": "Петропавловск", "petropavlovsk": "Петропавловск",
  "aktau": "Актау", "aqtau": "Актау",
  "temirtau": "Темиртау",
  "turkestan": "Туркестан", "turkistan": "Туркестан",
  "kokshetau": "Кокшетау",
  "taldykorgan": "Талдыкорган", "taldyqorgan": "Талдыкорган",
  "ekibastuz": "Экибастуз",
  "rudny": "Рудный", "rudniy": "Рудный",
  "zhezkazgan": "Жезказган", "jezkazgan": "Жезказган",
  "kaskelen": "Каскелен",
  "talgar": "Талгар",
  "konaev": "Конаев", "qonaev": "Конаев", "kapshagay": "Конаев", "kapchagay": "Конаев",
  "zhanaozen": "Жанаозен", "janaozen": "Жанаозен",
  "baikonur": "Байконур", "baykonyr": "Байконур",
  "balkhash": "Балхаш", "balqash": "Балхаш",
  "kentau": "Кентау",
  "satpaev": "Сатпаев", "satbayev": "Сатпаев",
  "saran": "Сарань",
  "shchuchinsk": "Щучинск", "shchuchye": "Щучинск", "burabay": "Щучинск",
  "ridder": "Риддер",
  "aksay": "Аксай", "aqsai": "Аксай",
  "stepnogorsk": "Степногорск",
};

const normalizeCity = (raw: string): string | null => {
  if (!raw) return null;
  const s = raw.trim();
  if (KZ_CITIES.includes(s)) return s;
  const lower = s.toLowerCase();
  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  for (const c of KZ_CITIES) if (c.toLowerCase() === lower) return c;
  return null;
};
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

  // Auto-detect city by geolocation on first visit
  useEffect(() => {
    try {
      if (localStorage.getItem("bb_city_detected") === "1") return;
      if (localStorage.getItem("bb_city")) return;
    } catch {}

    let cancelled = false;
    const applyCity = (name: string | null) => {
      const matched = name ? normalizeCity(name) : null;
      if (matched && !cancelled) {
        setCity(matched);
        try {
          localStorage.setItem("bb_city", matched);
          localStorage.setItem("bb_city_detected", "1");
        } catch {}
      } else {
        try { localStorage.setItem("bb_city_detected", "1"); } catch {}
      }
    };

    const tryIpFallback = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) return applyCity(null);
        const data = await res.json();
        applyCity(data?.city || null);
      } catch { applyCity(null); }
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`
            );
            const data = await res.json();
            const addr = data?.address || {};
            const name = addr.city || addr.town || addr.village || addr.municipality || addr.state || null;
            applyCity(name);
          } catch { tryIpFallback(); }
        },
        () => { tryIpFallback(); },
        { timeout: 5000, maximumAge: 600000 }
      );
    } else {
      tryIpFallback();
    }

    return () => { cancelled = true; };
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
