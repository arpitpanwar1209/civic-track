import React, { useEffect, useState, useContext } from "react";
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

import { AuthContext } from "../auth/AuthContext";

export default function EditIssue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authedFetch, user, loading: authLoading } =
    useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location: "",
    status: "pending", // ✅ VALID BACKEND STATUS
    photo: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [preview, setPreview] = useState(null);

  // =====================================================
  // Guard: ONLY consumers allowed
  // =====================================================
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (user.role !== "consumer") {
      navigate("/provider/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // =====================================================
  // Handle input
  // =====================================================
  const handleInput = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files?.[0] || null;
      setFormData((prev) => ({ ...prev, photo: file }));
      if (file) setPreview(URL.createObjectURL(file));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =====================================================
  // Load issue
  // =====================================================
  useEffect(() => {
    if (!user || user.role !== "consumer") return;

    const loadIssue = async () => {
      try {
        const res = await authedFetch(
          `/reports/consumer/issues/${id}/`
        );
        if (!res.ok) throw new Error();

        const data = await res.json();

        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          priority: data.priority || "medium",
          location: data.location || "",
          status: data.status || "pending",
          photo: null,
        });

        if (data.photo) {
          setPreview(data.photo);
        }
      } catch {
        setMsg({
          type: "danger",
          text: "⚠️ Unable to load issue.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadIssue();
  }, [id, user, authedFetch]);

  // =====================================================
  // Submit update
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    const form = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === "photo" && val === null) return;
      form.append(key, val);
    });

    try {
      const res = await authedFetch(
        `/reports/consumer/issues/${id}/`,
        {
          method: "PATCH",
          body: form,
        }
      );

      if (!res.ok) throw new Error();

      setMsg({
        type: "success",
        text: "✅ Issue updated successfully!",
      });

      setTimeout(
        () => navigate("/consumer/dashboard"),
        800
      );
    } catch {
      setMsg({
        type: "danger",
        text: "⚠️ Failed to update issue.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // Render guards
  // =====================================================
  if (authLoading || loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user || user.role !== "consumer") {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          You are not authorized to edit this issue.
        </Alert>
      </Container>
    );
  }

  // =====================================================
  // Render
  // =====================================================
  return (
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <BackButton />

      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="fw-bold mb-3">✏️ Edit Issue</h3>

          {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

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
                <option value="drainage">Drainage & Sewage</option>
                <option value="street_light">Street Lighting</option>
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
        </Card.Body>
      </Card>
    </Container>
  );
}
