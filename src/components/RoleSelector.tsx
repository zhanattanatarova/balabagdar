import { useState } from "react";
import { Users, Building2, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import logo from "@/assets/balahub-logo.png";

interface RoleSelectorProps {
  onComplete: () => void;
}

const RoleSelector = ({ onComplete }: RoleSelectorProps) => {
  const { t } = useLanguage();
  const { assignRole } = useUserRole();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (role: AppRole) => {
    setLoading(true);
    const error = await assignRole(role);
    setLoading(false);
    if (!error) onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="bg-card rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-slide-up">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Balausa" className="w-14 h-14" />
        </div>
        <h2 className="text-xl font-black text-center">{t("role.title")}</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">{t("role.subtitle")}</p>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => handleSelect("parent")}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-black text-sm">{t("role.parent")}</p>
                <p className="text-xs text-muted-foreground">{t("role.parent_desc")}</p>
              </div>
            </button>

            <button
              onClick={() => handleSelect("club_owner")}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-secondary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Building2 size={24} className="text-secondary" />
              </div>
              <div>
                <p className="font-black text-sm">{t("role.club")}</p>
                <p className="text-xs text-muted-foreground">{t("role.club_desc")}</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelector;
