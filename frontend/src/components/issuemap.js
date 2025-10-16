// frontend/src/components/IssueMap.js
import React from "react";
import { Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import SafeMap from "./safemap";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Validate coordinates
const isValidCoord = (lat, lon) =>
  typeof lat === "number" &&
  typeof lon === "number" &&
  Number.isFinite(lat) &&
  Number.isFinite(lon) &&
  lat >= -90 &&
  lat <= 90 &&
  lon >= -180 &&
  lon <= 180;

export default function IssueMap({ issues = [], handleLike, handleDelete }) {
  // Pick first valid issue for centering, else fallback handled in SafeMap
  const firstValid = issues.find((i) => isValidCoord(i.latitude, i.longitude));
  const centerLat = firstValid?.latitude ?? null;
  const centerLon = firstValid?.longitude ?? null;

  return (
    <SafeMap
      latitude={centerLat}
      longitude={centerLon}
      zoom={12}
      style={{ height: "500px", width: "100%", borderRadius: "10px" }}
    >
      {issues.map((issue) =>
        isValidCoord(issue.latitude, issue.longitude) ? (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
          >
            <Popup minWidth={260}>
              <div
                style={{
                  fontSize: "0.95em",
                  lineHeight: "1.4",
                  maxWidth: "250px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "1.1em",
                    fontWeight: "600",
                  }}
                >
                  {issue.title}
                </h3>

                <p style={{ margin: "4px 0" }}>{issue.description}</p>

                <p style={{ margin: "4px 0", fontSize: "0.9em" }}>
                  <strong>Category:</strong> {issue.category} <br />
                  <strong>Priority:</strong> {issue.priority} <br />
                  <strong>Status:</strong> {issue.status}
                </p>

                {/* Photo preview with fallback */}
                <div style={{ margin: "8px 0" }}>
                  {issue.photo ? (
                    <img
                      src={
                        issue.photo.startsWith("http")
                          ? issue.photo
                          : `http://127.0.0.1:8000${issue.photo}`
                      }
                      alt="Issue"
                      style={{
                        width: "100%",
                        maxHeight: "120px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "80px",
                        borderRadius: "6px",
                        background: "#f2f2f2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.85em",
                        color: "#666",
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>

                {/* Likes */}
                <p style={{ fontSize: "0.85em", margin: "5px 0" }}>
                  👍 {issue.likes_count || 0} likes
                </p>

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                    marginTop: "6px",
                  }}
                >
                  {handleLike && (
                    <button
                      onClick={() => handleLike(issue.id)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "none",
                        background: "#2ecc71",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "0.85em",
                      }}
                    >
                      👍 Like
                    </button>
                  )}

                  <Link
                    to={`/edit-issue/${issue.id}`}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "5px",
                      background: "#f39c12",
                      color: "white",
                      textDecoration: "none",
                      fontSize: "0.85em",
                    }}
                  >
                    ✏️ Edit
                  </Link>

                  {handleDelete && (
                    <button
                      onClick={() => handleDelete(issue.id)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "none",
                        background: "#e74c3c",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "0.85em",
                      }}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </SafeMap>
  );
}
