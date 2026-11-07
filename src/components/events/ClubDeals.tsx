import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { PubCard } from "@/components/sections/Cards";
import { PUB_COLS, type Pub } from "@/lib/publicData";
import { dealActive } from "@/lib/collections";

export default function ClubDeals({ clubId }: { clubId: string }) {
  const { lang } = useLanguage();
  const [items, setItems] = useState<Pub[]>([]);
  useEffect(() => {
    (supabase as any).from("announcements_public").select(PUB_COLS).eq("club_id", clubId).in("category", ["promo", "trial"])
      .gt("expires_at", new Date().toISOString())
      .then(({ data }: { data: Pub[] | null }) => setItems((data || []).filter((p) => dealActive(p))));
  }, [clubId]);
  if (!items.length) return null;
  const title = { ru: "Акции центра", kz: "Орталық акциялары", en: "Center deals" }[lang];
  return (
    <div className="px-4 mt-4">
      <h2 className="font-black text-sm mb-2">{title}</h2>
      <div className="space-y-2">{items.map((p) => <PubCard key={p.id} pub={p} />)}</div>
    </div>
  );
}
