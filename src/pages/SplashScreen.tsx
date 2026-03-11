import { useEffect, useState } from "react";
import logo from "@/assets/balahub-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 400);
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary transition-opacity duration-400 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <img
        src={logo}
        alt="BalaHub логотип"
        className="w-32 h-32 animate-bounce-soft mb-6"
      />
      <h1 className="text-4xl font-extrabold text-primary-foreground tracking-tight">
        BalaHub
      </h1>
      <p className="text-primary-foreground/80 mt-2 text-lg font-semibold">
        🌱 Развитие начинается здесь
      </p>
      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-3 h-3 rounded-full bg-primary-foreground/60 animate-bounce-soft"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
