// src/pages/consumer/EditIssue.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Image,
} from "react-bootstrap";

import { AuthContext } from "../auth/AuthContext";

export default function EditIssue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authedFetch, user, loading: authLoading } = useContext(AuthContext);

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
        const res = await authedFetch(`/reports/consumer/issues/${id}/`);
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
          text: "System Error: Unable to load issue details.",
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
      const res = await authedFetch(`/reports/consumer/issues/${id}/`, {
        method: "PATCH",
        body: form,
      });

      if (!res.ok) throw new Error();

      setMsg({
        type: "success",
        text: "Issue updated successfully.",
      });

      setTimeout(() => navigate("/consumer/dashboard"), 800);
    } catch {
      setMsg({
        type: "danger",
        text: "Failed to update issue. Please try again.",
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
      <Container className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-4" />
        <h5 className="text-muted fw-bold tracking-wide">LOADING RECORD...</h5>
      </Container>
    );
  }

  if (!user || user.role !== "consumer") {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="border-0 shadow-sm border-start border-danger border-5">
          <h5 className="fw-bold mb-1">Access Denied</h5>
          <p className="mb-0">You are not authorized to edit this issue.</p>
        </Alert>
      </Container>
    );
  }

  // =====================================================
  // Render
  // =====================================================
  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* ================================== */}
      {/* HIGH-CONTRAST HEADER */}
      {/* ================================== */}
      <div className="bg-dark text-white py-4 mb-5 shadow-sm">
        <Container style={{ maxWidth: 800 }}>
          <div className="d-flex align-items-center gap-3">
            <BackButton />
            <div>
              <h1 className="h3 mb-1 fw-bolder tracking-tight">Edit Report</h1>
              <p className="text-secondary mb-0 small text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                Record ID: {id}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container style={{ maxWidth: 800 }}>
        
        {msg.text && (
          <Alert 
            variant={msg.type} 
            className={`border-0 shadow-sm mb-4 rounded-3 border-start border-4 ${msg.type === 'success' ? 'border-success' : 'border-danger'}`}
          >
            <span className="fw-medium">{msg.text}</span>
          </Alert>
        )}

        <Card className="border-0 shadow-sm rounded-4 bg-white">
          <Card.Body className="p-4 p-md-5">
            <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom">Issue Details</h4>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-dark">Issue Title</Form.Label>
                <Form.Control
                  className="py-2"
                  name="title"
                  value={formData.title}
                  onChange={handleInput}
                  placeholder="E.g., Pothole on Main Street"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-dark">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  className="py-2"
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  placeholder="Provide additional details about the issue..."
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">Category</Form.Label>
                    <Form.Select
                      className="py-2"
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
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">Priority Level</Form.Label>
                    <Form.Select
                      className="py-2"
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
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-dark">Location</Form.Label>
                <Form.Control
                  className="py-2"
                  name="location"
                  value={formData.location}
                  onChange={handleInput}
                  placeholder="Address or general area"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-dark">Attach Evidence (Photo)</Form.Label>
                <Form.Control
                  type="file"
                  name="photo"
                  className="py-2"
                  onChange={handleInput}
                  accept="image/*"
                />
              </Form.Group>

              {preview && (
                <div className="mb-4 p-3 bg-light rounded-3 border">
                  <p className="text-muted small fw-semibold mb-2 text-uppercase">Image Preview</p>
                  <div className="text-center">
                    <Image
                      src={preview}
                      rounded
                      className="shadow-sm"
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end mt-5 pt-3 border-top">
                <Button
                  variant="outline-secondary"
                  className="px-4 py-2 fw-medium me-3"
                  onClick={() => navigate("/consumer/dashboard")}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="dark"
                  className="px-5 py-2 fw-medium shadow-sm"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}