import { useEffect, useState } from "react";
import { currentCity, fetchClubs, fetchCollections, fetchPubs, type Collection, type Pub, type PubClub } from "@/lib/publicData";
import { resolveCollection } from "@/lib/collections";

export function useCityData(withCollections = false) {
  const [state, setState] = useState<{ loading: boolean; city: string; clubs: PubClub[]; pubs: Pub[]; collections: Collection[] }>({ loading: true, city: currentCity(), clubs: [], pubs: [], collections: [] });
  useEffect(() => {
    const city = currentCity();
    Promise.all([fetchClubs(city), fetchPubs(city), withCollections ? fetchCollections() : Promise.resolve([])])
      .then(([clubs, pubs, collections]) => setState({ loading: false, city, clubs, pubs, collections }));
  }, [withCollections]);
  return state;
}

export function resolvedCollections(collections: Collection[], clubs: PubClub[], pubs: Pub[]) {
  return collections.map((c) => ({ c, ...resolveCollection(c, clubs, pubs) })).filter((r) => r.clubs.length + r.pubs.length > 0);
}
