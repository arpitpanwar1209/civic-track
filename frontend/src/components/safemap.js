import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [28.6139, 77.2090]; // New Delhi

// Validate with bounds
const isValidCoord = (v, min, max) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;

const safeCoords = (lat, lon) =>
  isValidCoord(lat, -90, 90) && isValidCoord(lon, -180, 180)
    ? [lat, lon]
    : DEFAULT_CENTER;

// Smooth fly animation when coords change
function FlyToLocation({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (isValidCoord(lat, -90, 90) && isValidCoord(lon, -180, 180)) {
      map.flyTo([lat, lon], 14, { duration: 1.2 });
    }
  }, [lat, lon, map]);
  return null;
}

export default function SafeMap({
  latitude,
  longitude,
  zoom = 13,
  children,
  style = { height: "100%", width: "100%" },
}) {
  const coords = safeCoords(latitude, longitude);
  const key =
    isValidCoord(latitude, -90, 90) && isValidCoord(longitude, -180, 180)
      ? `${latitude}-${longitude}`
      : "default-map";

  return (
    <MapContainer key={key} center={coords} zoom={zoom} style={style}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {React.Children.toArray(children).filter(Boolean)}
      {isValidCoord(latitude, -90, 90) && isValidCoord(longitude, -180, 180) && (
        <FlyToLocation lat={latitude} lon={longitude} />
      )}
    </MapContainer>
  );
}
