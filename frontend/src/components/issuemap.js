// frontend/src/components/IssueMap.jsx

import React from "react";
import { Marker, Popup } from "react-leaflet";
import SafeMap from "./safemap";
import Status from "./Status";
import { Link } from "react-router-dom";
import L from "leaflet";
import { 
  FaThumbsUp, 
  FaTrash, 
  FaTools, 
  FaPlay, 
  FaCheck, 
  FaMapMarkerAlt 
} from "react-icons/fa";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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
  currentUser,
  onLike,
  onDelete,
  onClaim,
  onStart,
  onResolve,
}) {
  const firstValid = issues.find((i) =>
    isValidCoord(i.latitude, i.longitude)
  );

  const centerLat = firstValid?.latitude ?? 28.6139;
  const centerLon = firstValid?.longitude ?? 77.209;

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
      style={{ height: "500px", width: "100%", borderRadius: "16px", overflow: "hidden" }}
    >
      {issues.map((issue) =>
        isValidCoord(issue.latitude, issue.longitude) ? (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
          >
            <Popup minWidth={280} className="custom-popup">
              <div className="p-1">
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold text-dark mb-0 pe-2">{issue.title}</h6>
                </div>

                {/* Status and Category */}
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Status status={issue.status} />
                  <span className="text-primary fw-bold small text-uppercase" style={{ fontSize: '0.7rem' }}>
                    {issue.category}
                  </span>
                </div>

                <p className="small text-muted mb-3 lh-sm">{issue.description}</p>

                {/* Evidence Image */}
                {issue.image && (
                  <div className="mb-3 rounded overflow-hidden border">
                    <img
                      src={getImageUrl(issue.image)}
                      alt="Issue Evidence"
                      className="w-100"
                      style={{
                        maxHeight: "140px",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                  </div>
                )}

                {/* Location & Metrics */}
                <div className="mb-3">
                  {issue.distance && (
                    <div className="small text-dark fw-medium d-flex align-items-center mb-1">
                      <FaMapMarkerAlt className="text-muted me-2" />
                      {issue.distance.toFixed(2)} km from your location
                    </div>
                  )}
                  <div className="small text-muted d-flex align-items-center">
                    <FaThumbsUp className="me-2" /> {issue.likes_count} acknowledgments
                  </div>
                </div>

                <hr className="my-3 opacity-10" />

                {/* Role-Based Actions */}
                <div className="d-flex flex-wrap gap-2">
                  {role === "consumer" && (
                    <>
                      <button
                        className="btn btn-outline-success btn-sm rounded-pill px-3 fw-bold"
                        onClick={() => onLike(issue.id)}
                      >
                        Like
                      </button>

                      <Link
                        to={`/issues/${issue.id}/edit`}
                        className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-medium ms-auto"
                      >
                        Edit
                      </Link>

                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-2"
                        onClick={() => onDelete(issue.id)}
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}

                  {role === "provider" && issue.status === "pending" && (
                    <button
                      className="btn btn-dark btn-sm w-100 rounded-pill fw-bold"
                      onClick={() => onClaim(issue.id)}
                    >
                      <FaTools className="me-2 mb-1" /> Claim Task
                    </button>
                  )}

                  {role === "provider" &&
                    issue.status === "assigned" &&
                    issue.assigned_to_name === currentUser && (
                      <button
                        className="btn btn-warning btn-sm w-100 rounded-pill fw-bold"
                        onClick={() => onStart(issue.id)}
                      >
                        <FaPlay className="me-2 mb-1" /> Begin Work
                      </button>
                    )}

                  {role === "provider" &&
                    issue.status === "in_progress" &&
                    issue.assigned_to_name === currentUser && (
                      <button
                        className="btn btn-success btn-sm w-100 rounded-pill fw-bold"
                        onClick={() => onResolve(issue.id)}
                      >
                        <FaCheck className="me-2 mb-1" /> Mark Resolved
                      </button>
                    )}

                  {role === "provider" &&
                    issue.assigned_to_name &&
                    issue.assigned_to_name !== currentUser && (
                      <div className="w-100 text-center py-1 bg-light rounded-pill border">
                        <span className="text-muted small fw-bold">
                          Assigned to {issue.assigned_to_name}
                        </span>
                      </div>
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