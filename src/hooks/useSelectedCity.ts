import { useSyncExternalStore } from "react";
import { currentCity, selectCity, subscribeCity } from "@/lib/city";

export function useSelectedCity() {
  const city = useSyncExternalStore(subscribeCity, currentCity, () => "Актау");
  return [city, selectCity] as const;
}