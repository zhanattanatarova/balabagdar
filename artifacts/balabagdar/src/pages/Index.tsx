import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import SplashScreen from "./SplashScreen";
import HomePage from "./HomePage";
import MapPage from "./MapPage";
import NewsPage from "./NewsPage";
import ProfilePage from "./ProfilePage";
import NotificationsPage from "./NotificationsPage";
import ClubDashboard from "./ClubDashboard";
import ClubEditPage from "./ClubEditPage";
import BoardPage from "./BoardPage";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "";
  const [showSplash, setShowSplash] = useState(isHome);
  const [city, setCity] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {renderPage()}
      <BottomNav />
    </div>
  );
};

export default Index;
