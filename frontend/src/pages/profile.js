// src/pages/Profile.jsx

import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Badge
} from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

import { AuthContext } from "../auth/AuthContext";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function Profile() {
  const { user, authedFetch, setUser } = useContext(AuthContext);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    contact: "",
    role: "",
    profession: "",
    profile_pic: null
  });

  const [stats, setStats] = useState({
    reported: 0,
    claimed: 0,
    resolved: 0,
    pending: 0,
    in_progress: 0
  });

  const [preview, setPreview] = useState(null);
  const [newProfilePicFile, setNewProfilePicFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // =========================================
  // Load profile from auth context
  // =========================================
  useEffect(() => {
    if (!user) return;

    setProfile({
      username: user.username || "",
      email: user.email || "",
      contact: user.contact || "",
      role: user.role || "",
      profession: user.profession || "",
      profile_pic: user.profile_pic || null
    });
  }, [user]);

  // =========================================
  // Load statistics
  // =========================================
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        let endpoint =
          user.role === "provider"
            ? "/reports/provider/issues/"
            : "/reports/consumer/issues/";

        const res = await authedFetch(endpoint);
        const data = await res.json();
        const issues = Array.isArray(data) ? data : data.results || [];

        const resolved = issues.filter(i => i.status === "resolved").length;
        const pending = issues.filter(i => i.status === "pending").length;
        const inProgress = issues.filter(i => i.status === "in_progress").length;

        setStats({
          reported: issues.length,
          claimed: issues.length,
          resolved,
          pending,
          in_progress: inProgress
        });
      } catch (err) {
        console.error("Stats load failed", err);
      }
    };

    loadStats();
  }, [user, authedFetch]);

  // =========================================
  // Image URL helper
  // =========================================
  const normalizeImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE.replace("/api/v1", "")}${url}`;
  };

  // =========================================
  // File change
  // =========================================
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setNewProfilePicFile(file);
  };

  // =========================================
  // Input change
  // =========================================
  const onInputChange = (e) => {
    setProfile(prev => ({
      ...prev,
      contact: e.target.value
    }));
  };

  // =========================================
  // Save profile
  // =========================================
  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      const form = new FormData();

      if (profile.contact) {
        form.append("contact", profile.contact);
      }

      if (newProfilePicFile) {
        form.append("profile_pic", newProfilePicFile);
      }

      const res = await authedFetch("/accounts/profile/update/", {
        method: "PATCH",
        body: form
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Profile update failed");
      }

      setUser(prev => ({ ...prev, ...data }));

      setMsg({
        type: "success",
        text: "Profile updated successfully!"
      });

      setPreview(null);
    } catch {
      setMsg({
        type: "danger",
        text: "Update failed. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // Render Guards
  // =========================================
  if (!user) {
    return (
      <Container className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-4" />
        <h5 className="text-muted fw-bold tracking-wide">LOADING PROFILE...</h5>
      </Container>
    );
  }

  const imgSrc =
    preview ||
    normalizeImageUrl(profile.profile_pic) ||
    "https://placehold.co/150x150?text=User";

  const dashboardPath =
    user.role === "provider"
      ? "/provider-dashboard"
      : "/dashboard";

  // =========================================
  // Render
  // =========================================
  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* ================================== */}
      {/* HIGH-CONTRAST HEADER */}
      {/* ================================== */}
      <div className="bg-dark text-white py-4 mb-5 shadow-sm">
        <Container style={{ maxWidth: 900 }}>
          <div className="d-flex align-items-center gap-4">
            <Button
              as={Link}
              to={dashboardPath}
              variant="outline-light"
              className="rounded-pill px-3 py-2 d-flex align-items-center fw-medium transition-hover"
            >
              <FaArrowLeft className="me-2" />
              Back
            </Button>
            <div>
              <h1 className="h3 mb-1 fw-bolder tracking-tight">Account Profile</h1>
              <p className="text-secondary mb-0 small text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                Manage Settings & Metrics
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container style={{ maxWidth: 900 }}>
        
        {msg.text && (
          <Alert 
            variant={msg.type === "success" ? "success" : "danger"} 
            className={`border-0 shadow-sm mb-4 rounded-3 border-start border-4 ${msg.type === "success" ? "border-success" : "border-danger"}`}
          >
            <span className="fw-medium">{msg.text}</span>
          </Alert>
        )}

        <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <Card.Body className="p-4 p-md-5">
            
            <Row className="g-5">
              
              {/* LEFT COLUMN: Photo Upload */}
              <Col md={4} className="d-flex flex-column align-items-center border-end-md">
                <h6 className="text-muted small fw-bold text-uppercase mb-4 w-100 text-center text-md-start" style={{ letterSpacing: '0.5px' }}>
                  Profile Image
                </h6>
                <div className="position-relative mb-4 text-center">
                  <Image
                    src={imgSrc}
                    roundedCircle
                    className="shadow-sm border border-light border-4"
                    style={{
                      width: 160,
                      height: 160,
                      objectFit: "cover"
                    }}
                  />
                </div>
                
                <Form.Group>
                  <Form.Label className="btn btn-outline-dark rounded-pill px-4 py-2 fw-medium shadow-sm transition-hover">
                    Upload New Photo
                    <Form.Control
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={onFileChange}
                    />
                  </Form.Label>
                  <Form.Text className="d-block text-center mt-2 text-muted small">
                    JPG, GIF or PNG. Max size 2MB.
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* RIGHT COLUMN: Form Details */}
              <Col md={8}>
                <h6 className="text-muted small fw-bold text-uppercase mb-4 pb-2 border-bottom" style={{ letterSpacing: '0.5px' }}>
                  Account Information
                </h6>
                <Form onSubmit={handleSave}>
                  <Row className="g-3 mb-3">
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                          Username
                        </Form.Label>
                        <Form.Control 
                          value={profile.username} 
                          disabled 
                          className="py-2 bg-light text-muted border-0" 
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                          Role
                        </Form.Label>
                        <Form.Control 
                          value={profile.role?.toUpperCase()} 
                          disabled 
                          className="py-2 bg-light text-muted border-0 fw-bold" 
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Email Address
                    </Form.Label>
                    <Form.Control 
                      value={profile.email} 
                      disabled 
                      className="py-2 bg-light text-muted border-0" 
                    />
                  </Form.Group>

                  {profile.role === "provider" && (
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                        Profession / Department
                      </Form.Label>
                      <Form.Control
                        value={profile.profession}
                        disabled
                        className="py-2 bg-light text-muted border-0"
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-5">
                    <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Contact Number
                    </Form.Label>
                    <Form.Control
                      value={profile.contact}
                      onChange={onInputChange}
                      className="py-2 shadow-sm"
                      placeholder="Enter a valid contact number"
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button 
                      type="submit" 
                      variant="dark" 
                      className="rounded-pill px-5 py-2 fw-medium shadow-sm transition-hover" 
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>

            {/* ================================== */}
            {/* ACTIVITY METRICS */}
            {/* ================================== */}
            <div className="mt-5 pt-4 border-top">
              <h6 className="text-muted small fw-bold text-uppercase mb-4" style={{ letterSpacing: '0.5px' }}>
                Activity Metrics
              </h6>

              <div className="d-flex gap-3 flex-wrap">
                {profile.role === "consumer" && (
                  <>
                    <Badge bg="primary" className="rounded-pill px-4 py-2 fs-6 shadow-sm fw-medium">
                      Reports Filed: {stats.reported}
                    </Badge>
                    <Badge bg="warning" text="dark" className="rounded-pill px-4 py-2 fs-6 shadow-sm fw-medium">
                      Pending: {stats.pending}
                    </Badge>
                    <Badge bg="success" className="rounded-pill px-4 py-2 fs-6 shadow-sm fw-medium">
                      Resolved: {stats.resolved}
                    </Badge>
                  </>
                )}

                {profile.role === "provider" && (
                  <>
                    <Badge bg="info" text="dark" className="rounded-pill px-4 py-2 fs-6 shadow-sm fw-medium">
                      Tasks Claimed: {stats.claimed}
                    </Badge>
                    <Badge bg="warning" text="dark" className="rounded-pill px-4 py-2 fs-6 shadow-sm fw-medium">
                      In Progress: {stats.in_progress}
                    </Badge>
                    <Badge bg="success" className="rounded-pill px-4 py-2 fs-6 shadow-sm fw-medium">
                      Resolved: {stats.resolved}
                    </Badge>
                  </>
                )}
              </div>
            </div>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}