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

/**
 * Backend base = http://host/api/v1
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

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

  // --------------------------------------------------
  // Load profile
  // --------------------------------------------------
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(
          `${API_BASE}/accounts/profile/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Profile fetch failed");

        const data = await res.json();

        setProfile({
          username: data.username || "",
          email: data.email || "",
          contact: data.contact || "",
          profile_pic: data.profile_pic || null,
        });
      } catch (err) {
        console.error(err);
        setMsg({
          type: "danger",
          text: "⚠️ Failed to load profile.",
        });
      } finally {
        setLoading(false);
      }
    }

    if (token) loadProfile();
  }, [token]);

  // --------------------------------------------------
  // Image change
  // --------------------------------------------------
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setNewProfilePicFile(file);
  };

  // --------------------------------------------------
  // Text input
  // --------------------------------------------------
  const onInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // --------------------------------------------------
  // Save profile
  // --------------------------------------------------
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      const form = new FormData();
      form.append("username", profile.username);
      form.append("email", profile.email);
      form.append("contact", profile.contact);

      if (newProfilePicFile) {
        form.append("profile_pic", newProfilePicFile);
      }

      const res = await fetch(
        `${API_BASE}/accounts/profile/update/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Update failed");
      }

      setMsg({
        type: "success",
        text: "✅ Profile updated successfully!",
      });

      setProfile((prev) => ({
        ...prev,
        profile_pic: data.profile_pic || prev.profile_pic,
      }));

      setPreview(null);
      setNewProfilePicFile(null);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "danger",
        text: `⚠️ ${err.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const imgSrc =
    preview ||
    (profile.profile_pic
      ? profile.profile_pic.startsWith("http")
        ? profile.profile_pic
        : `${API_BASE.replace("/api/v1", "")}${profile.profile_pic}`
      : "https://placehold.co/150x150/EFEFEF/AAAAAA?text=No+Image");

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <Container className="my-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          👤 My Profile
          <Button
            as={Link}
            to="/dashboard"
            variant="outline-secondary"
            size="sm"
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>
        </Card.Header>

        <Card.Body className="p-4">
          {msg.text && (
            <Alert
              variant={msg.type}
              dismissible
              onClose={() => setMsg({ type: "", text: "" })}
            >
              {msg.text}
            </Alert>
          )}

          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading profile…</p>
            </div>
          ) : (
            <Form onSubmit={handleSave}>
              <Row>
                {/* IMAGE */}
                <Col md={4} className="text-center mb-4">
                  <Image
                    src={imgSrc}
                    roundedCircle
                    style={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                      border: "4px solid #eee",
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

                {/* FORM */}
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
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
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      name="contact"
                      value={profile.contact}
                      onChange={onInputChange}
                    />
                  </Form.Group>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Saving…
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
