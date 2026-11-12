import { useEffect, useState } from "react";
import { fetchClubs, fetchCollections, fetchPubs, type Collection, type Pub, type PubClub } from "@/lib/publicData";
import { useSelectedCity } from "./useSelectedCity";
import { resolveCollection } from "@/lib/collections";

export function useCityData(withCollections = false) {
  const [city] = useSelectedCity();
  const [state, setState] = useState<{ loading: boolean; city: string; clubs: PubClub[]; pubs: Pub[]; collections: Collection[] }>({ loading: true, city, clubs: [], pubs: [], collections: [] });
  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, city, clubs: [], pubs: [], collections: [] });
    Promise.all([fetchClubs(city), fetchPubs(city), withCollections ? fetchCollections() : Promise.resolve([])])
      .then(([clubs, pubs, collections]) => { if (!cancelled) setState({ loading: false, city, clubs, pubs, collections }); })
      .catch(() => { if (!cancelled) setState({ loading: false, city, clubs: [], pubs: [], collections: [] }); });
    return () => { cancelled = true; };
  }, [city, withCollections]);
  return state;
}

export function resolvedCollections(collections: Collection[], clubs: PubClub[], pubs: Pub[]) {
  return collections.map((c) => ({ c, ...resolveCollection(c, clubs, pubs) })).filter((r) => r.clubs.length + r.pubs.length > 0);
}
