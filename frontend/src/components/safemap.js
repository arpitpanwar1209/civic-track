// src/components/SafeMap.jsx

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

// Smooth move animation component
function FlyTo({ lat, lon, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (isValidCoord(lat, -90, 90) && isValidCoord(lon, -180, 180)) {
      map.flyTo([lat, lon], zoom, { 
        duration: 1.5,
        easeLinearity: 0.25 
      });
    }
  }, [lat, lon, zoom, map]);
  return null;
}

export default function SafeMap({
  latitude,
  longitude,
  zoom = 13,
  enableFly = true,
  // Using a clean, high-contrast tile set is key for enterprise looks
  tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  style = { height: "100%", width: "100%" },
  children,
}) {
  const coords = safeCoords(latitude, longitude);

  // Dynamic key to force remount on state change for stability
  const key =
    isValidCoord(latitude, -90, 90) && isValidCoord(longitude, -180, 180)
      ? `${latitude}-${longitude}`
      : "default-center";

  const safeChildren = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);

  return (
    <div className="map-container-wrapper shadow-sm border overflow-hidden" style={{ borderRadius: '16px', ...style }}>
      <MapContainer 
        key={key} 
        center={coords} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer 
          url={tileUrl} 
          attribution={tileAttribution} 
        />

        {safeChildren}

        {enableFly &&
          isValidCoord(latitude, -90, 90) &&
          isValidCoord(longitude, -180, 180) && (
            <FlyTo lat={latitude} lon={longitude} zoom={zoom} />
          )}
      </MapContainer>

      {/* Enterprise Map Styling Overrides */}
      <style>{`
        .leaflet-container {
          background-color: #f8f9fa !important;
        }
        /* Mute the tile colors slightly to keep focus on the markers/UI */
        .leaflet-tile-container {
          filter: grayscale(0.2) contrast(1.1);
        }
        /* Professional Shadow for Popups */
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
          padding: 4px;
        }
        .leaflet-popup-tip {
          box-shadow: none !important;
        }
        /* Style the Zoom controls to match enterprise buttons */
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        .leaflet-bar a {
          background-color: #fff !important;
          color: #212529 !important;
          border-bottom: 1px solid #f1f3f5 !important;
        }
        .leaflet-bar a:hover {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
}