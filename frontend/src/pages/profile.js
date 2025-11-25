import React, { useEffect, useState } from "react";
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

export default function Profile() {
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
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  // -----------------------------------------
  // Load Profile
  // -----------------------------------------
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API_URL}/api/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile.");

        const data = await res.json();

        setProfile({
          username: data.username || "",
          email: data.email || "",
          contact: data.contact || "",
          profile_pic: data.profile_pic || null,
        });
      } catch (e) {
        console.error(e);
        setMsg({ type: "danger", text: "⚠️ Failed to load profile" });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [API_URL, token]);

  // -----------------------------------------
  // Image Preview
  // -----------------------------------------
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setNewProfilePicFile(file);
  };

  // -----------------------------------------
  // Text Input Change
  // -----------------------------------------
  const onInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // -----------------------------------------
  // Save Profile
  // -----------------------------------------
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      const form = new FormData();
      form.append("username", profile.username);
      form.append("email", profile.email);
      form.append("contact", profile.contact);

      if (newProfilePicFile) form.append("profile_pic", newProfilePicFile);

      const res = await fetch(`${API_URL}/api/profile/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to update profile");
      }

      setMsg({ type: "success", text: "✅ Profile updated successfully!" });

      setProfile((prev) => ({
        ...prev,
        profile_pic: data.profile_pic || prev.profile_pic,
      }));

      setPreview(null);
      setNewProfilePicFile(null);
    } catch (e) {
      console.error(e);
      setMsg({ type: "danger", text: `⚠️ ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  const imgSrc =
    preview ||
    (profile.profile_pic
      ? profile.profile_pic.startsWith("http")
        ? profile.profile_pic
        : `${API_URL}${profile.profile_pic}`
      : "https://placehold.co/150x150/EFEFEF/AAAAAA?text=No+Image");

  return (
    <Container className="my-4">
      <Card className="shadow-sm">
        <Card.Header
          as="h2"
          className="d-flex justify-content-between align-items-center"
        >
          👤 My Profile
          <Button as={Link} to="/dashboard" variant="outline-secondary" size="sm">
            <FaArrowLeft className="me-2" /> Back to Dashboard
          </Button>
        </Card.Header>

        <Card.Body className="p-4">
          {msg.text && (
            <Alert
              variant={msg.type}
              onClose={() => setMsg({ type: "", text: "" })}
              dismissible
            >
              {msg.text}
            </Alert>
          )}

          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading Profile...</p>
            </div>
          ) : (
            <Form onSubmit={handleSave} encType="multipart/form-data">
              <Row>
                {/* LEFT SIDE (IMAGE) */}
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <Image
                    src={imgSrc}
                    roundedCircle
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      border: "4px solid #eee",
                    }}
                  />

                  <Form.Group controlId="formFile" className="mt-3">
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

                {/* RIGHT SIDE (FORM) */}
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={onInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={onInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Contact Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact"
                      value={profile.contact}
                      onChange={onInputChange}
                      placeholder="e.g., +91 9876543210"
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
