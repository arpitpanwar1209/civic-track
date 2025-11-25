// frontend/src/components/IssueMap.js
import React from "react";
import { Marker, Popup } from "react-leaflet";
import SafeMap from "./safemap";
import { Link } from "react-router-dom";
import L from "leaflet";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Validate lat/lon
const isValidCoord = (lat, lon) =>
  typeof lat === "number" &&
  typeof lon === "number" &&
  Number.isFinite(lat) &&
  lat >= -90 &&
  lat <= 90 &&
  lon >= -180 &&
  lon <= 180;

export default function IssueMap({
  issues = [],
  API_URL,
  role,
  onLike,
  onDelete,
  onClaim,
  onResolve,
}) {
  // Default center: first valid issue
  const firstValid = issues.find((i) => isValidCoord(i.latitude, i.longitude));
  const centerLat = firstValid?.latitude ?? null;
  const centerLon = firstValid?.longitude ?? null;

  // Helper for proper image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  return (
    <SafeMap
      latitude={centerLat}
      longitude={centerLon}
      zoom={12}
      style={{ height: "500px", width: "100%", borderRadius: "10px" }}
    >
      {issues.map((issue) =>
        isValidCoord(issue.latitude, issue.longitude) ? (
          <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
            <Popup minWidth={260}>
              <div className="issue-popup">
                <h5 className="fw-bold">{issue.title}</h5>

                <p className="mb-1">{issue.description}</p>

                <p className="text-muted small mb-1">
                  <strong>Category:</strong> {issue.category} <br />
                  <strong>Priority:</strong> {issue.priority} <br />
                  <strong>Status:</strong> {issue.status}
                </p>

                {/* Photo */}
                <div className="my-2">
                  {issue.photo ? (
                    <img
                      src={getImageUrl(issue.photo)}
                      alt="Issue"
                      className="rounded w-100"
                      style={{
                        maxHeight: "130px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="no-photo">No Image</div>
                  )}
                </div>

                {/* Likes */}
                <p className="small text-muted">
                  👍 {issue.likes_count} likes
                </p>

                {/* Buttons */}
                <div className="popup-buttons">
                  {/* Consumer Like */}
                  {role === "consumer" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => onLike(issue.id)}
                    >
                      👍 Like
                    </button>
                  )}

                  {/* Consumer Edit */}
                  {role === "consumer" && (
                    <Link
                      to={`/issues/${issue.id}/edit`}
                      className="btn btn-warning btn-sm"
                    >
                      ✏ Edit
                    </Link>
                  )}

                  {/* Consumer Delete */}
                  {role === "consumer" && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(issue.id)}
                    >
                      🗑 Delete
                    </button>
                  )}

                  {/* Provider Claim */}
                  {role === "provider" && !issue.assigned_to_name && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onClaim(issue.id)}
                    >
                      🔧 Claim
                    </button>
                  )}

                  {/* Provider Resolve */}
                  {role === "provider" &&
                    issue.assigned_to_name === localStorage.getItem("username") &&
                    issue.status === "in_progress" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onResolve(issue.id)}
                      >
                        ✔ Resolve
                      </button>
                    )}

                  {/* Already claimed by someone else */}
                  {role === "provider" &&
                    issue.assigned_to_name &&
                    issue.assigned_to_name !==
                      localStorage.getItem("username") && (
                      <span className="badge bg-secondary">
                        Claimed by {issue.assigned_to_name}
                      </span>
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
