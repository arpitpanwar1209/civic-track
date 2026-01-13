import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import BackButton from "../components/BackButton";

/**
 * Backend base = http://host/api/v1
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "consumer",
    profession: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  // --------------------------------------------------
  // Submit signup
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const payload = { ...formData };

    // Consumers don't need profession
    if (payload.role === "consumer") {
      delete payload.profession;
    }

    try {
      // 1️⃣ Signup
      const res = await fetch(`${API_BASE}/accounts/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          typeof data === "object"
            ? Object.entries(data)
                .map(([k, v]) =>
                  Array.isArray(v)
                    ? `${k}: ${v.join(", ")}`
                    : `${k}: ${v}`
                )
                .join("; ")
            : data.detail || "Signup failed.";

        setError(msg);
        return;
      }

      setSuccess("🎉 Account created successfully! Logging you in…");

      // 2️⃣ Auto-login
      const loginRes = await fetch(`${API_BASE}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem("access", loginData.access);
        localStorage.setItem("refresh", loginData.refresh);
        localStorage.setItem("username", formData.username);
        localStorage.setItem("role", formData.role);
        localStorage.setItem("profession", formData.profession || "");

        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Connection failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <Container className="py-4">
      {/* ✅ BACK BUTTON */}
      <BackButton fallback="/" />

      <Row className="justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center fw-bold mb-4">
                Create an Account
              </h2>

              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>I am a</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="consumer">
                      Consumer (Report Issues)
                    </option>
                    <option value="provider">
                      Provider (Fix Issues)
                    </option>
                  </Form.Select>
                </Form.Group>

                {formData.role === "provider" && (
                  <Form.Group className="mb-4">
                    <Form.Label>Select Profession</Form.Label>
                    <Form.Select
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select --</option>
                      <option value="electricity">Electricity</option>
                      <option value="road">Road Maintenance</option>
                      <option value="water">Water Supply</option>
                      <option value="garbage">Garbage & Sanitation</option>
                      <option value="drainage">Drainage & Sewage</option>
                      <option value="street_light">Street Lighting</option>
                    </Form.Select>
                  </Form.Group>
                )}

                <Button
                  type="submit"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <small>
                  Already have an account?{" "}
                  <Link to="/login">Log In</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
