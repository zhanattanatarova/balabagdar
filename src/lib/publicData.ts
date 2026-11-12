import { supabase } from "@/integrations/supabase/client";
import type { CollectionRule } from "./collections";

export interface PubClub {
  id: string; name_ru: string; name_kz?: string | null; name_en?: string | null; avatar_url?: string | null;
  category?: string | null; categories?: string[] | null; age_min?: number | null; age_max?: number | null;
  city: string; price_from?: number | null; price_currency?: string | null;
}
export interface Pub {
  id: string; category: string; title: string; body: string; name: string; city: string;
  event_date: string | null; event_end_date: string | null; image_url: string | null; club_id: string | null;
  source_label: string | null; source_url: string | null; public_phone: string | null;
  age_min: number | null; age_max: number | null; is_free: boolean | null; price_from: number | null; event_kind: string | null;
  season: string | null; deal_until: string | null; discount_text: string | null; is_promoted: boolean; created_at: string;
}
export interface Collection {
  id: string; slug: string; title_ru: string; title_kz: string | null; title_en: string | null;
  description_ru: string | null; description_kz: string | null; description_en: string | null;
  cover_emoji: string | null; rule_json: CollectionRule | null; club_ids: string[]; event_ids: string[]; sort: number; is_active: boolean;
}

export const CLUB_COLS = "id,name_ru,name_kz,name_en,avatar_url,category,categories,age_min,age_max,city,price_from,price_currency";
export const PUB_COLS = "id,category,title,body,name,city,event_date,event_end_date,image_url,club_id,source_label,source_url,public_phone,age_min,age_max,is_free,price_from,event_kind,season,deal_until,discount_text,is_promoted,created_at";

export { currentCity } from "./city";

export async function fetchClubs(city: string): Promise<PubClub[]> {
  const { data } = await supabase.from("clubs").select(CLUB_COLS).eq("is_active", true).eq("city", city).limit(1000);
  return (data as unknown as PubClub[]) || [];
}
export async function fetchPubs(city: string): Promise<Pub[]> {
  const { data } = await (supabase as any).from("announcements_public").select(PUB_COLS).eq("city", city).gt("expires_at", new Date().toISOString());
  return (data as Pub[]) || [];
}
export async function fetchCollections(): Promise<Collection[]> {
  const { data } = await (supabase as any).from("collections").select("*").eq("is_active", true).order("sort");
  return (data as Collection[]) || [];
}
export async function hasPublishedArticles(): Promise<boolean> {
  const { count } = await (supabase as any).from("articles").select("id", { count: "exact", head: true }).eq("is_published", true).lte("published_at", new Date().toISOString());
  return (count || 0) > 0;
}
export function pick<T extends Record<string, any>>(o: T, base: string, lang: string): string {
  const v = lang === "kz" ? o[`${base}_kz`] : lang === "en" ? o[`${base}_en`] : null;
  return v || o[`${base}_ru`] || "";
}
