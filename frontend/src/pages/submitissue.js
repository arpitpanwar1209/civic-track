// frontend/src/pages/SubmitIssue.js
import React, { useState, useEffect, useRef } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SafeMap from "../components/safemap"; // ✅ Reuse safe map

// Fix default leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Shared coordinate validator (same as IssueMap/SafeMap)
const isValidCoord = (lat, lon) =>
  typeof lat === "number" &&
  typeof lon === "number" &&
  Number.isFinite(lat) &&
  Number.isFinite(lon) &&
  lat >= -90 &&
  lat <= 90 &&
  lon >= -180 &&
  lon <= 180;

export default function SubmitIssue({ token: tokenProp, onSubmitted }) {
  const [token, setToken] = useState(tokenProp ?? null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!token && !tokenProp) {
      const stored = localStorage.getItem("access");
      if (stored) setToken(stored);
    }
  }, [tokenProp, token]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Low",
    location: "",
    latitude: null,
    longitude: null,
    photo: null,
  });

  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(t);
  }, [message]);

  // ✅ Draggable marker inside SafeMap
  function DraggableMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        if (isValidCoord(lat, lng)) {
          setFormData((p) => ({ ...p, latitude: lat, longitude: lng }));
        }
      },
    });

    if (!isValidCoord(formData.latitude, formData.longitude)) return null;

    return (
      <Marker
        position={[formData.latitude, formData.longitude]}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            if (isValidCoord(lat, lng)) {
              setFormData((p) => ({ ...p, latitude: lat, longitude: lng }));
            }
          },
        }}
      >
        <Popup>Drag or click to set location</Popup>
      </Marker>
    );
  }

  // ✅ Search via Nominatim
  const handleSearch = async () => {
    const q = (formData.location || "").trim();
    if (!q) {
      setMessage({ type: "error", text: "Enter a place to search." });
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setMessage({ type: "error", text: "Location not found." });
        return;
      }
      const { lat, lon } = data[0];
      const latN = Number(lat);
      const lonN = Number(lon);
      if (!isValidCoord(latN, lonN)) {
        setMessage({ type: "error", text: "Invalid coordinates from search." });
        return;
      }
      setFormData((p) => ({ ...p, latitude: latN, longitude: lonN }));
      setMessage({ type: "success", text: "Location set." });
    } catch (err) {
      console.error("Search error:", err);
      setMessage({ type: "error", text: "Search failed. Try again." });
    }
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.title.trim() || !formData.description.trim()) {
      setMessage({ type: "error", text: "Title and description are required." });
      setSubmitting(false);
      return;
    }

    const body = new FormData();
    body.append("title", formData.title.trim());
    body.append("description", formData.description.trim());
    if (formData.category) body.append("category", formData.category.trim());
    if (formData.priority) body.append("priority", formData.priority);
    if (isValidCoord(formData.latitude, formData.longitude)) {
      body.append("latitude", formData.latitude);
      body.append("longitude", formData.longitude);
    }
    if (formData.location) body.append("location", formData.location);
    if (formData.photo) body.append("photo", formData.photo);

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/issues/", {
        method: "POST",
        headers,
        body,
      });

      if (res.ok) {
        const result = await res.json().catch(() => null);
        setMessage({ type: "success", text: "✅ Issue submitted successfully!" });
        setFormData({
          title: "",
          description: "",
          category: "",
          priority: "Low",
          location: "",
          latitude: null,
          longitude: null,
          photo: null,
        });
        if (fileInputRef.current) fileInputRef.current.value = null;
        if (typeof onSubmitted === "function") onSubmitted(result);
      } else {
        const err = await res.json().catch(() => null);
        setMessage({
          type: "error",
          text:
            err?.detail ||
            (typeof err === "object"
              ? Object.entries(err)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                  .join("; ")
              : "Failed to submit issue."),
        });
      }
    } catch (err) {
      console.error("Submit error", err);
      setMessage({ type: "error", text: "Network/server error." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>➕ Submit New Issue</h2>

      {message && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 6,
            color: "#fff",
            background: message.type === "success" ? "#2ecc71" : "#e74c3c",
            fontWeight: 500,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title *"
          value={formData.title}
          onChange={(e) =>
            setFormData((p) => ({ ...p, title: e.target.value }))
          }
          required
          style={{ display: "block", width: "100%", marginBottom: 12, padding: 10 }}
        />

        <textarea
          placeholder="Description *"
          value={formData.description}
          onChange={(e) =>
            setFormData((p) => ({ ...p, description: e.target.value }))
          }
          required
          style={{
            display: "block",
            width: "100%",
            marginBottom: 12,
            padding: 10,
            minHeight: 100,
          }}
        />

        <input
          type="text"
          placeholder="Category (e.g. road, water)"
          value={formData.category}
          onChange={(e) =>
            setFormData((p) => ({ ...p, category: e.target.value }))
          }
          style={{ display: "block", width: "100%", marginBottom: 12, padding: 10 }}
        />

        <select
          value={formData.priority}
          onChange={(e) =>
            setFormData((p) => ({ ...p, priority: e.target.value }))
          }
          style={{ display: "block", width: "100%", marginBottom: 12, padding: 10 }}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        {/* Search input + button */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search location"
            value={formData.location}
            onChange={(e) =>
              setFormData((p) => ({ ...p, location: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            style={{ flex: 1, padding: 10 }}
          />
          <button type="button" onClick={handleSearch} style={{ padding: "10px 14px" }}>
            🔍
          </button>
        </div>

        {/* ✅ SafeMap instead of raw MapContainer */}
        <div
          style={{
            height: 400,
            width: "100%",
            marginBottom: 12,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <SafeMap
            latitude={formData.latitude}
            longitude={formData.longitude}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <DraggableMarker />
          </SafeMap>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              photo: e.target.files?.[0] ?? null,
            }))
          }
          style={{ display: "block", marginBottom: 12 }}
        />

        <button type="submit" disabled={submitting} style={{ padding: "10px 16px" }}>
          {submitting ? "Submitting..." : "Submit Issue"}
        </button>
      </form>
    </div>
  );
}
