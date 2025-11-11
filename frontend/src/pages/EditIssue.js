// frontend/src/pages/EditIssue.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import BackButton from "../components/BackButton";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
    latitude: 0,
    longitude: 0,
  });

  const [photo, setPhoto] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load issue data
  useEffect(() => {
    fetch(`${API_URL}/api/issues/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load issue data.");
        return res.json();
      })
      .then((data) => {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          priority: data.priority || "Medium",
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
        });
      })
      .catch((err) => setMessage({ type: "danger", text: err.message }))
      .finally(() => setLoading(false));
  }, [id, token]);

  // Map marker handler
  function DraggableMarker() {
    const map = useMapEvents({
      click(e) {
        setFormData({ ...formData, latitude: e.latlng.lat, longitude: e.latlng.lng });
      },
    });

    useEffect(() => {
      if (formData.latitude && formData.longitude) {
        map.flyTo([formData.latitude, formData.longitude], map.getZoom());
      }
    }, [formData.latitude, formData.longitude, map]);

    return (
      <Marker
        draggable
        eventHandlers={{
          dragend(e) {
            const latlng = e.target.getLatLng();
            setFormData({ ...formData, latitude: latlng.lat, longitude: latlng.lng });
          },
        }}
        position={[formData.latitude, formData.longitude]}
      >
        <Popup>Drag me or click map to update location</Popup>
      </Marker>
    );
  }

  // Search Location
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
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    });
    setSearchQuery(place.display_name);
    setSearchResults([]);
  };

  // Submit changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    const body = new FormData();
    body.append("title", formData.title);
    body.append("description", formData.description);
    body.append("category", formData.category);
    body.append("priority", formData.priority);
    body.append("latitude", formData.latitude);
    body.append("longitude", formData.longitude);
    if (photo) body.append("photo", photo);

    try {
      const res = await fetch(`${API_URL}/api/issues/${id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (!res.ok) throw new Error("Something went wrong");

      setMessage({ type: "success", text: "✅ Issue updated successfully!" });
      setTimeout(() => navigate("/dashboard"), 1200);

    } catch (err) {
      setMessage({ type: "danger", text: `❌ Failed: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading issue details...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <BackButton />

      <Card className="shadow-sm">
        <Card.Header as="h2" className="d-flex justify-content-between align-items-center">
          ✏️ Edit Issue
          <Button as={Link} to="/dashboard" variant="outline-secondary" size="sm">
            <FaArrowLeft className="me-2" /> Back to Dashboard
          </Button>
        </Card.Header>

        <Card.Body className="p-4">
          {message.text && (
            <Alert variant={message.type} dismissible onClose={() => setMessage({ type: "", text: "" })}>
              {message.text}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Form.Group as={Col} md="8" className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </Form.Select>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label>Upload New Photo</Form.Label>
                <Form.Control type="file" onChange={(e) => setPhoto(e.target.files[0])} />
              </Form.Group>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Search Location</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for an address..."
                />
                <Button variant="outline-secondary" onClick={handleSearch}>Search</Button>
              </InputGroup>
            </Form.Group>

            {searchResults.length > 0 && (
              <ListGroup className="mb-3">
                {searchResults.map((place) => (
                  <ListGroup.Item key={place.place_id} action onClick={() => handleSelectLocation(place)}>
                    {place.display_name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            <div style={{ height: "400px" }} className="mb-3">
              <MapContainer center={[formData.latitude, formData.longitude]} zoom={15} style={{ height: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <DraggableMarker />
              </MapContainer>
            </div>

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving…" : "💾 Save Changes"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
