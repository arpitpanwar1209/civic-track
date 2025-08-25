// frontend/src/pages/EditIssue.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function EditIssue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [issue, setIssue] = useState(null);
  const [formData, setFormData] = useState({});
  const [photo, setPhoto] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" }); // ✅ notification state
  const [loading, setLoading] = useState(false);

  // ✅ Fetch issue details from API
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/issues/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setIssue(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          priority: data.priority || "Medium",
          location: data.location || "",
          latitude: data.latitude,
          longitude: data.longitude,
        });
      })
      .catch((err) => console.error("Error loading issue:", err));
  }, [id, token]);

  // ✅ Draggable marker on map
  function DraggableMarker() {
    const [position, setPosition] = useState([formData.latitude, formData.longitude]);
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setFormData({ ...formData, latitude: e.latlng.lat, longitude: e.latlng.lng });
      },
    });

    return (
      <Marker
        draggable
        eventHandlers={{
          dragend(e) {
            const latlng = e.target.getLatLng();
            setFormData({ ...formData, latitude: latlng.lat, longitude: latlng.lng });
          },
        }}
        position={position}
      >
        <Popup>Drag me or click map to update location</Popup>
      </Marker>
    );
  }

  // ✅ Search location with OpenStreetMap Nominatim API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
    );
    const data = await res.json();
    setSearchResults(data);
  };

  const handleSelectLocation = (place) => {
    setFormData({
      ...formData,
      location: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    });
    setSearchResults([]);
  };

  // ✅ Save updated issue
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const body = new FormData();
    Object.keys(formData).forEach((key) => body.append(key, formData[key]));
    if (photo) body.append("photo", photo);

    const res = await fetch(`http://127.0.0.1:8000/api/issues/${id}/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });

    setLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: "✅ Issue updated successfully!" });

      // redirect after short delay
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      const error = await res.json();
      setMessage({ type: "error", text: `❌ Failed: ${error.detail || "Something went wrong"}` });
    }
  };

  if (!issue) return <p>Loading issue...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>✏️ Edit Issue</h2>

      {/* ✅ Notification Box */}
      {message.text && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "5px",
            background: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />

        <label>Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />

        <label>Priority</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <label>Upload New Photo</label>
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />

        {/* ✅ Search box */}
        <form onSubmit={handleSearch} style={{ margin: "15px 0" }}>
          <input
            type="text"
            value={searchQuery}
            placeholder="Search location..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {searchResults.length > 0 && (
          <ul style={{ border: "1px solid #ddd", padding: "10px" }}>
            {searchResults.map((place) => (
              <li
                key={place.place_id}
                onClick={() => handleSelectLocation(place)}
                style={{ cursor: "pointer", padding: "5px" }}
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}

        {/* ✅ Map */}
        <div style={{ height: "400px", marginTop: "15px" }}>
          <MapContainer
            center={[formData.latitude, formData.longitude]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <DraggableMarker />
          </MapContainer>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: "15px", padding: "10px 20px" }}
        >
          {loading ? "Saving..." : "💾 Save Changes"}
        </button>
      </form>
    </div>
  );
}
