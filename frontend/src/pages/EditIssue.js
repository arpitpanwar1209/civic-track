import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Image,
} from "react-bootstrap";

/**
 * Backend base = http://host/api/v1
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function EditIssue() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    location: "",
    status: "",
    photo: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [preview, setPreview] = useState(null);

  const token = localStorage.getItem("access");

  // -------------------------
  // Handle input
  // -------------------------
  const handleInput = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, photo: file }));
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // -------------------------
  // Load issue
  // -------------------------
  useEffect(() => {
    async function loadIssue() {
      try {
        const res = await fetch(
          `${API_BASE}/reports/issues/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("load failed");

        const data = await res.json();

        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          priority: data.priority || "medium",
          location: data.location || "",
          status: data.status || "submitted",
          photo: null,
        });

        if (data.photo) {
          setPreview(
            data.photo.startsWith("http")
              ? data.photo
              : `${API_BASE.replace("/api/v1", "")}${data.photo}`
          );
        }
      } catch (err) {
        console.error(err);
        setMsg({
          type: "danger",
          text: "⚠️ Unable to load issue.",
        });
      } finally {
        setLoading(false);
      }
    }

    if (!token) {
      navigate("/login");
      return;
    }

    loadIssue();
  }, [id, token, navigate]);

  // -------------------------
  // Submit update
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === "photo" && val === null) return;
      form.append(key, val);
    });

    try {
      const res = await fetch(
        `${API_BASE}/reports/issues/${id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!res.ok) throw new Error("save failed");

      setMsg({
        type: "success",
        text: "✅ Issue updated successfully!",
      });

      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "danger",
        text: "⚠️ Failed to update issue.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <BackButton />

      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="fw-bold mb-3">✏️ Edit Issue</h3>

          {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  name="title"
                  value={formData.title}
                  onChange={handleInput}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInput}
                  required
                >
                  <option value="">Select category</option>
                  <option value="road">Road</option>
                  <option value="garbage">Garbage</option>
                  <option value="water">Water Supply</option>
                  <option value="electricity">Electricity</option>
                  <option value="sewage">Sewage</option>
                  <option value="lighting">Street Lighting</option>
                  <option value="pollution">Pollution</option>
                  <option value="traffic">Traffic</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInput}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  name="location"
                  value={formData.location}
                  onChange={handleInput}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInput}
                >
                  <option value="submitted">Submitted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Photo</Form.Label>
                <Form.Control
                  type="file"
                  name="photo"
                  onChange={handleInput}
                />
              </Form.Group>

              {preview && (
                <div className="text-center mb-3">
                  <Image
                    src={preview}
                    rounded
                    style={{
                      width: "100%",
                      maxHeight: 250,
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-100"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
