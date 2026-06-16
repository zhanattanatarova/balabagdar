import { Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="pb-24 max-w-6xl mx-auto min-h-screen">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-black">{t("profile.my_clubs")}</h1>
      </div>
      <div className="flex flex-col items-center justify-center text-center px-8 pt-24">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Heart size={36} className="text-destructive" />
        </div>
        <h2 className="font-black text-base mb-1">Пока пусто</h2>
        <p className="text-sm text-muted-foreground font-medium max-w-xs">
          Добавляйте кружки в избранное, нажимая на сердечко на карточке кружка
        </p>
        <button onClick={() => navigate("/")} className="mt-6 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm cartoon-card border-primary">
          Найти кружки
        </button>
      </div>
    </div>
  );
};

export default FavoritesPage;
