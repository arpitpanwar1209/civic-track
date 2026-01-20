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
    profile_pic: null,
  });

  const [newProfilePicFile, setNewProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // -----------------------------
  // Sync from AuthContext
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    setProfile({
      username: user.username || "",
      email: user.email || "",
      contact: user.contact || "",
      profile_pic: user.profile_pic || null,
    });
  }, [user]);

  // -----------------------------
  // Normalize image URLs
  // -----------------------------
  const normalizeImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE.replace("/api/v1", "")}${url}`;
  };

  // -----------------------------
  // File change
  // -----------------------------
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setNewProfilePicFile(file);
  };

  // -----------------------------
  // Input change (ONLY contact)
  // -----------------------------
  const onInputChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      contact: e.target.value,
    }));
  };

  // -----------------------------
  // Save profile (FIXED)
  // -----------------------------
  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setSaving(true);

    try {
      const form = new FormData();

      // ✅ ONLY send allowed fields
      if (profile.contact) {
        form.append("contact", profile.contact);
      }

      if (newProfilePicFile) {
        form.append("profile_pic", newProfilePicFile);
      }

      const res = await authedFetch("/accounts/profile/update/", {
        method: "PATCH",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          JSON.stringify(data) || "Profile update failed"
        );
      }

      // Update auth context safely
      setUser((prev) => ({ ...prev, ...data }));

      setPreview(null);
      setNewProfilePicFile(null);

      setMsg({
        type: "success",
        text: "✅ Profile updated successfully!",
      });
    } catch (err) {
      setMsg({
        type: "danger",
        text: err.message || "Update failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  const imgSrc =
    preview ||
    normalizeImageUrl(profile.profile_pic) ||
    "https://placehold.co/150x150/EFEFEF/AAAAAA?text=No+Image";

  const dashboardPath =
    user.role === "provider"
      ? "/provider/dashboard"
      : "/consumer/dashboard";

  return (
    <Container className="my-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          👤 My Profile
          <Button
            as={Link}
            to={dashboardPath}
            variant="outline-secondary"
            size="sm"
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>
        </Card.Header>

        <Card.Body className="p-4">
          {msg.text && (
            <Alert variant={msg.type}>{msg.text}</Alert>
          )}

          <Form onSubmit={handleSave}>
            <Row>
              <Col md={4} className="text-center mb-4">
                <Image
                  src={imgSrc}
                  roundedCircle
                  style={{
                    width: 150,
                    height: 150,
                    objectFit: "cover",
                  }}
                />

                <Form.Group className="mt-3">
                  <Form.Label className="btn btn-outline-primary btn-sm">
                    📷 Change Photo
                    <Form.Control
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={onFileChange}
                    />
                  </Form.Label>
                </Form.Group>
              </Col>

              <Col md={8}>
                {/* READ ONLY */}
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control value={profile.username} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={profile.email} disabled />
                </Form.Group>

                {/* EDITABLE */}
                <Form.Group className="mb-3">
                  <Form.Label>Contact</Form.Label>
                  <Form.Control
                    name="contact"
                    value={profile.contact}
                    onChange={onInputChange}
                  />
                </Form.Group>

                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
