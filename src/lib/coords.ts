export interface LatLng {
  lat: number;
  lng: number;
}

const valid = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);

const pair = (a: string, b: string): LatLng | null => {
  const lat = parseFloat(a);
  const lng = parseFloat(b);
  return valid(lat, lng) ? { lat, lng } : null;
};

/**
 * Extracts coordinates from a pasted Google Maps / 2GIS link or a plain "lat, lng" string.
 * 2GIS writes coordinates as "lng,lat"; Google writes "lat,lng".
 * Short links (maps.app.goo.gl, go.2gis.com) carry no coordinates and return null.
 */
export function parseCoordinates(input: string): LatLng | null {
  const text = decodeURIComponent((input || "").trim());
  if (!text) return null;

  // Plain "43.65, 51.17"
  const plain = text.match(/^(-?\d{1,2}\.\d+)\s*[,; ]\s*(-?\d{1,3}\.\d+)$/);
  if (plain) return pair(plain[1], plain[2]);

  if (/2gis\./i.test(text)) {
    // ?m=51.17,43.65/16  or /geo/<id>/51.17,43.65  or /directions/points/|51.17,43.65;...
    const m = text.match(/[?&]m=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/i)
      || text.match(/\/geo\/(?:\d+\/)?(-?\d+\.\d+),(-?\d+\.\d+)/)
      || text.match(/(-?\d{2,3}\.\d+),(-?\d{1,2}\.\d+)/);
    if (m) return pair(m[2], m[1]);
    return null;
  }

  // Google: !3dLAT!4dLNG (exact place) beats @LAT,LNG (viewport)
  const g3d = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (g3d) return pair(g3d[1], g3d[2]);
  const gq = text.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
  if (gq) return pair(gq[1], gq[2]);
  const gat = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (gat) return pair(gat[1], gat[2]);
  const any = text.match(/(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/);
  if (any) return pair(any[1], any[2]);
  return null;
}
