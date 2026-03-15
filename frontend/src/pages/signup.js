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

    if (
      formData.role === "provider" &&
      !formData.profession.trim()
    ) {
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
                  Array.isArray(v)
                    ? `${k}: ${v.join(", ")}`
                    : `${k}: ${v}`
                )
                .join("; ")
            : data?.detail || "Signup failed.";

        setError(msg);
        return;
      }

      setSuccess("Account created successfully. Logging in...");

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
      setError("Connection failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
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
                    autoComplete="username"
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
                    autoComplete="email"
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
                    autoComplete="new-password"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
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
                    <Form.Label>Profession</Form.Label>
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
                      <option value="garbage">
                        Garbage & Sanitation
                      </option>
                      <option value="drainage">
                        Drainage & Sewage
                      </option>
                      <option value="street_light">
                        Street Lighting
                      </option>
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