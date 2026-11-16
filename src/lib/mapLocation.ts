import { parseCoordinates } from "./coords";

export function mapCoordinates(club: { latitude?: number | null; longitude?: number | null; twogis_url?: string | null }) {
  const { latitude, longitude } = club;
  if (latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 && (latitude !== 0 || longitude !== 0)) return { lat: latitude, lng: longitude };
  try { return parseCoordinates(club.twogis_url || ""); } catch { return null; }
}

export function mapAddressQueries(address: string | null, city: string): string[] {
  if (!address?.trim() || /^\+?[\d\s()]{10,}$/.test(address.trim())) return [];
  const normalized = address.trim().replace(/мкр\.?|шағын\s*аудан/gi, "микрорайон").replace(/\s+/g, " ");
  const micro = normalized.match(/(\d{1,2}[А-Яа-яA-Za-z]?)\s*микрорайон/i) || normalized.match(/^(\d{1,2})\s*[-/]\s*\d/);
  return [...new Set([`${normalized}, ${city}, Казахстан`, ...(micro ? [`${micro[1]} микрорайон, ${city}, Казахстан`] : [])])];
}