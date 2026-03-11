import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import SplashScreen from "./SplashScreen";
import HomePage from "./HomePage";
import MapPage from "./MapPage";
import NewsPage from "./NewsPage";
import ProfilePage from "./ProfilePage";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const renderPage = () => {
    switch (location.pathname) {
      case "/map":
        return <MapPage />;
      case "/news":
        return <NewsPage />;
      case "/profile":
        return <ProfilePage />;
      default:
        return <HomePage />;
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
