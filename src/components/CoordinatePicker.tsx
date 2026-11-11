import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapPin, X } from "lucide-react";
import { parseCoordinates } from "@/lib/coords";

const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const KZ_CENTER: [number, number] = [48.0196, 66.9237];

interface Props {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  inputClassName?: string;
  labelClassName?: string;
}

const ClickHandler = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
};

const Recenter = ({ lat, lng }: { lat: number | null; lng: number | null }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], Math.max(map.getZoom(), 15));
  }, [lat, lng, map]);
  return null;
};

const round = (v: number) => Math.round(v * 1e6) / 1e6;

const CoordinatePicker = ({ latitude, longitude, onChange, inputClassName = "", labelClassName = "" }: Props) => {
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const hasPoint = latitude != null && longitude != null;

  const applyLink = (value: string) => {
    setLink(value);
    if (!value.trim()) { setLinkError(""); return; }
    const c = parseCoordinates(value);
    if (c) {
      setLinkError("");
      onChange(round(c.lat), round(c.lng));
    } else {
      setLinkError("В ссылке нет координат. Откройте точку на карте 2GIS/Google и скопируйте полную ссылку из адресной строки — или нажмите на карту ниже.");
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label className={labelClassName}>🔗 Ссылка 2GIS / Google Maps или «широта, долгота»</label>
        <input value={link} onChange={(e) => applyLink(e.target.value)} placeholder="https://2gis.kz/aktau/geo/... или 43.6512, 51.1734" className={inputClassName} />
        {linkError && <p className="text-[11px] font-bold text-destructive mt-1">{linkError}</p>}
      </div>
      <p className={labelClassName}>…или нажмите на карту, чтобы поставить точку</p>
      <div className="h-56 rounded-xl overflow-hidden border border-border relative z-0">
        <MapContainer center={hasPoint ? [latitude!, longitude!] : KZ_CENTER} zoom={hasPoint ? 16 : 5} className="h-full w-full" scrollWheelZoom={false}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onPick={(lat, lng) => onChange(round(lat), round(lng))} />
          <Recenter lat={latitude} lng={longitude} />
          {hasPoint && <Marker position={[latitude!, longitude!]} icon={pinIcon} />}
        </MapContainer>
      </div>
      <div className="flex items-center gap-2 text-xs font-bold">
        <MapPin size={14} className="text-primary" />
        {hasPoint ? (
          <>
            <span>{latitude}, {longitude}</span>
            <button type="button" onClick={() => { onChange(null, null); setLink(""); }} className="ml-auto inline-flex items-center gap-1 text-destructive">
              <X size={12} /> Убрать точку
            </button>
          </>
        ) : (
          <span className="text-muted-foreground">Точка не выбрана</span>
        )}
      </div>
    </div>
  );
};

export default CoordinatePicker;
