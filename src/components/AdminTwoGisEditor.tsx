import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  clubId: string;
  rating: number | null;
  count: number | null;
  url: string | null;
  checkedAt: string | null;
  onSaved: (patch: { twogis_rating: number | null; twogis_reviews_count: number | null; twogis_url: string; twogis_checked_at: string | null }) => void;
}

/** Admin-only editor for the external 2GIS rating of a club. */
const AdminTwoGisEditor = ({ clubId, rating, count, url, checkedAt, onSaved }: Props) => {
  const [open, setOpen] = useState(false);
  const [r, setR] = useState(rating != null ? String(rating) : "");
  const [n, setN] = useState(count != null ? String(count) : "");
  const [u, setU] = useState(url || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const ratingVal = r.trim() === "" ? null : Number(r.replace(",", "."));
    const countVal = n.trim() === "" ? null : Number(n);
    if (ratingVal !== null && (!Number.isFinite(ratingVal) || ratingVal < 1 || ratingVal > 5)) {
      return toast({ title: "Рейтинг 2GIS должен быть от 1 до 5", variant: "destructive" });
    }
    if (countVal !== null && (!Number.isInteger(countVal) || countVal < 0)) {
      return toast({ title: "Число отзывов — целое число от 0", variant: "destructive" });
    }
    if (u.trim() && !/^https:\/\/(www\.)?2gis\.[a-z]+\//i.test(u.trim())) {
      return toast({ title: "Ссылка должна вести на 2gis", variant: "destructive" });
    }
    setSaving(true);
    const patch = {
      twogis_rating: ratingVal === null ? null : Math.round(ratingVal * 10) / 10,
      twogis_reviews_count: countVal,
      twogis_url: u.trim(),
      twogis_checked_at: ratingVal === null ? null : new Date().toISOString(),
    };
    const { error } = await supabase.from("clubs").update(patch).eq("id", clubId);
    setSaving(false);
    if (error) return toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    onSaved(patch);
    setOpen(false);
    toast({ title: "Рейтинг 2GIS сохранён" });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[10px] font-bold text-muted-foreground mt-0.5 underline-offset-2 hover:underline text-left">
        2GIS: {rating != null ? `★ ${Number(rating).toFixed(1)} · ${count ?? 0} отз.` : "нет данных"}
        {checkedAt ? ` · проверено ${new Date(checkedAt).toLocaleDateString("ru")}` : ""} · изменить
      </button>
    );
  }

  return (
    <div className="mt-2 p-2 rounded-lg bg-card border border-border space-y-1.5">
      <div className="flex gap-2">
        <label className="flex-1 text-[10px] font-bold">Рейтинг 2GIS
          <input value={r} onChange={(e) => setR(e.target.value)} inputMode="decimal" placeholder="4.9"
            className="mt-0.5 w-full px-2 py-1 rounded-md border border-border bg-background text-xs" />
        </label>
        <label className="flex-1 text-[10px] font-bold">Отзывов в 2GIS
          <input value={n} onChange={(e) => setN(e.target.value)} inputMode="numeric" placeholder="39"
            className="mt-0.5 w-full px-2 py-1 rounded-md border border-border bg-background text-xs" />
        </label>
      </div>
      <label className="block text-[10px] font-bold">Ссылка 2GIS
        <input value={u} onChange={(e) => setU(e.target.value)} placeholder="https://2gis.kz/aktau/firm/..."
          className="mt-0.5 w-full px-2 py-1 rounded-md border border-border bg-background text-xs" />
      </label>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="text-[10px] font-black px-3 py-1 rounded-md bg-primary text-primary-foreground disabled:opacity-60">
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        <button onClick={() => setOpen(false)} className="text-[10px] font-bold px-3 py-1 rounded-md bg-muted">Отмена</button>
      </div>
    </div>
  );
};

export default AdminTwoGisEditor;
