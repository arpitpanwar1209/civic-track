// src/pages/Signup.jsx
import React, { useState, useContext } from "react";
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

import { AuthContext } from "../auth/AuthContext";
import BackButton from "../components/BackButton";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function Signup() {
  const { saveTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "consumer",
    profession: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------
  // Input change
  // -----------------------------
  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  // -----------------------------
  // Validation
  // -----------------------------
  const validate = () => {
    if (!formData.username.trim()) {
      return "Username is required.";
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      return "Enter a valid email address.";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    if (formData.role === "provider" && !formData.profession.trim()) {
      return "Profession is required for providers.";
    }

    return null;
  };

  // -----------------------------
  // SIGNUP
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const payload = { ...formData };
    delete payload.confirmPassword;

    if (payload.role === "consumer") {
      delete payload.profession;
    }

    try {
      // 1️⃣ Create account
      const res = await fetch(`${API_BASE}/accounts/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        const msg =
          typeof data === "object"
            ? Object.entries(data)
                .map(([k, v]) =>
                  Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${v}`
                )
                .join("; ")
            : data?.detail || "Signup failed.";

        setError(msg);
        return;
      }

      setSuccess("Account created successfully. Authenticating session...");

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

      if (!loginRes.ok) {
        navigate("/login");
        return;
      }

      saveTokens(loginData.access, loginData.refresh);

      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      console.error(err);
      setError("Connection failed. Please check your network and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column pt-4 pb-5">
      <Container>
        <div className="mb-4">
          <BackButton fallback="/" />
        </div>

        <Row className="justify-content-center mt-2 mt-md-4">
          <Col md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-5">
              {/* Top accent border */}
              <div className="bg-dark" style={{ height: "6px" }}></div>

              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4 pb-2">
                  <h2 className="fw-bolder tracking-tight text-dark mb-1">
                    Create an Account
                  </h2>
                  <p className="text-muted small fw-medium">
                    Join CivicTrack to report or resolve community issues.
                  </p>
                </div>

                {success && (
                  <Alert variant="success" className="border-0 shadow-sm mb-4 rounded-3 border-start border-success border-4">
                    <span className="fw-medium">{success}</span>
                  </Alert>
                )}
                {error && (
                  <Alert variant="danger" className="border-0 shadow-sm mb-4 rounded-3 border-start border-danger border-4">
                    <span className="fw-medium">{error}</span>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Username
                    </Form.Label>
                    <Form.Control
                      className="py-2"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="username"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Email Address
                    </Form.Label>
                    <Form.Control
                      className="py-2"
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col sm={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                          Password
                        </Form.Label>
                        <Form.Control
                          className="py-2"
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="new-password"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                          Confirm Password
                        </Form.Label>
                        <Form.Control
                          className="py-2"
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          autoComplete="new-password"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4 pb-3 border-bottom border-light">
                    <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Account Type
                    </Form.Label>
                    <Form.Select
                      className="py-2 fw-medium"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="consumer">Consumer (Report Issues)</option>
                      <option value="provider">Service Provider (Fix Issues)</option>
                    </Form.Select>
                  </Form.Group>

                  {formData.role === "provider" && (
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                        Profession / Department
                      </Form.Label>
                      <Form.Select
                        className="py-2"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Select Department --</option>
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
                    variant="dark"
                    className="w-100 py-2 mt-2 rounded-pill fw-bold shadow-sm transition-hover"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Creating Account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4 pt-3 border-top border-light">
                  <p className="small text-dark fw-medium mb-0">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary text-decoration-none fw-bold transition-hover">
                      Log In
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}