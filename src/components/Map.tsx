import { useMemo, ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  lat: number;
  lng: number;
  popup?: ReactNode;
  tooltip?: ReactNode;
  iconUrl?: string;
}

interface MapProps {
  lat?: number;
  lng?: number;
  height?: string;
  zoom?: number;
  markers?: MapMarker[];
  polyline?: Array<[number, number]>;
}

export const Map = ({ lat, lng, height = '300px', zoom = 13, markers = [], polyline }: MapProps) => {
  const center = useMemo<[number, number]>(() => {
    if (markers.length > 0) return [markers[0].lat, markers[0].lng];
    return [lat || 0, lng || 0];
  }, [lat, lng, markers]);

  return (
    <div style={{ height, width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, idx) => (
          <Marker key={idx} position={[m.lat, m.lng]} icon={m.iconUrl ? L.icon({ iconUrl: m.iconUrl, iconAnchor:[12,41], popupAnchor:[0,-32], iconSize: [25,41] }) : undefined}>
            {m.tooltip && <Tooltip direction="top" offset={[0, -25]}>{m.tooltip}</Tooltip>}
            {m.popup && (
              <Popup>
                {m.popup}
              </Popup>
            )}
          </Marker>
        ))}
        {polyline && polyline.length >= 2 && (
          <Polyline positions={polyline} color="#2563eb" weight={4} dashArray="6 10" />
        )}
      </MapContainer>
    </div>
  );
};


