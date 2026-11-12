const CITY_KEY = "bb_city";
export const CITY_EVENT = "balahub-city";
let fallbackCity = "Актау";

export function currentCity(): string {
  try { return localStorage.getItem(CITY_KEY) || fallbackCity; } catch { return fallbackCity; }
}

export function selectCity(city: string): void {
  fallbackCity = city;
  try { localStorage.setItem(CITY_KEY, city); } catch { /* Keep selection in memory. */ }
  window.dispatchEvent(new Event(CITY_EVENT));
}

export function subscribeCity(listener: () => void): () => void {
  window.addEventListener(CITY_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CITY_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}