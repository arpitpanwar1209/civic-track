import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [28.6139, 77.2090]; // New Delhi

// Validation util
const isValidCoord = (v, min, max) =>
  typeof v === "number" &&
  Number.isFinite(v) &&
  v >= min &&
  v <= max;

const safeCoords = (lat, lon) =>
  isValidCoord(lat, -90, 90) && isValidCoord(lon, -180, 180)
    ? [lat, lon]
    : DEFAULT_CENTER;

// Smooth move animation
function FlyTo({ lat, lon, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (isValidCoord(lat, -90, 90) && isValidCoord(lon, -180, 180)) {
      map.flyTo([lat, lon], zoom, { duration: 1.2 });
    }
  }, [lat, lon, zoom, map]);
  return null;
}

export default function SafeMap({
  latitude,
  longitude,
  zoom = 13,
  enableFly = true,
  tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  tileAttribution = '&copy; OpenStreetMap contributors',
  style = { height: "100%", width: "100%" },
  children,
}) {
  const coords = safeCoords(latitude, longitude);

  // dynamic key to force remount on invalid/valid state change
  const key =
    isValidCoord(latitude, -90, 90) && isValidCoord(longitude, -180, 180)
      ? `${latitude}-${longitude}`
      : "default-center";

  const safeChildren = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);

  return (
    <MapContainer key={key} center={coords} zoom={zoom} style={style}>
      <TileLayer url={tileUrl} attribution={tileAttribution} />

      {safeChildren}

      {enableFly &&
        isValidCoord(latitude, -90, 90) &&
        isValidCoord(longitude, -180, 180) && (
          <FlyTo lat={latitude} lon={longitude} zoom={zoom} />
        )}
    </MapContainer>
  );
}
