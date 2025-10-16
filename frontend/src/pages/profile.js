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
    profile_pic: null, // URL string from API
  });
  const [newProfilePicFile, setNewProfilePicFile] = useState(null); // Store the File object
  const [preview, setPreview] = useState(null); // Local preview for new file
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");
  // It's best practice to use an environment variable for your API URL
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  // Load current profile
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

  // Handle file choose
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setNewProfilePicFile(file); // Store File object
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

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

      const res = await fetch(`${API_URL}/api/profile/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Could not save profile");
      }
      
      const data = await res.json();
      setMsg({ type: "success", text: "✅ Profile updated successfully!" });
      setProfile((p) => ({
        ...p,
        profile_pic: data.profile_pic || p.profile_pic,
      }));
      setNewProfilePicFile(null);
      setPreview(null);

    } catch (e) {
      console.error(e);
      setMsg({ type: "danger", text: `⚠️ ${e.message || 'Network error'}` });
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
        <Card.Header as="h2" className="d-flex justify-content-between align-items-center">
          👤 My Profile
          <Button as={Link} to="/dashboard" variant="outline-secondary" size="sm">
            <FaArrowLeft className="me-2" /> Back to Dashboard
          </Button>
        </Card.Header>
        <Card.Body className="p-4">
          {msg.text && (
            <Alert variant={msg.type} onClose={() => setMsg({ type: "", text: "" })} dismissible>
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
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <Image
                    src={imgSrc}
                    alt="Profile Avatar"
                    roundedCircle
                    style={{ width: "150px", height: "150px", objectFit: "cover", border: "4px solid #eee" }}
                  />
                  <Form.Group controlId="formFile" className="mt-3">
                     <Form.Label className="btn btn-outline-primary btn-sm">
                        📷 Change Photo
                        <Form.Control type="file" accept="image/*" onChange={onFileChange} hidden />
                     </Form.Label>
                  </Form.Group>
                </Col>

                <Col md={8}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={onInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={onInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formContact">
                    <Form.Label>Contact Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact"
                      value={profile.contact || ""}
                      onChange={onInputChange}
                      placeholder="e.g., +91 1234567890"
                    />
                  </Form.Group>
                  
                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
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