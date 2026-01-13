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
  Modal,
} from "react-bootstrap";
import BackButton from "../components/BackButton"; // ✅ ADD THIS

/**
 * Backend base = http://host/api/v1
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid username or password.");
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      const profileRes = await fetch(
        `${API_BASE}/accounts/profile/`,
        {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        }
      );

      if (!profileRes.ok) throw new Error();

      const profile = await profileRes.json();

      localStorage.setItem("username", profile.username);
      localStorage.setItem("role", profile.role);
      localStorage.setItem("profession", profile.profession || "");

      setSuccess("Login successful! Redirecting…");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch {
      setError("Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // PASSWORD RESET
  // --------------------------------------------------
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetMsg("");
    setResetLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/accounts/password-reset/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        }
      );

      const data = await res.json();

      setResetMsg(
        res.ok
          ? "✅ Password reset link sent to your email."
          : data.detail || "⚠️ Unable to send reset email."
      );
    } catch {
      setResetMsg("⚠️ Server error. Try again later.");
    } finally {
      setResetLoading(false);
    }
  };

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <Container className="py-4">
      {/* ✅ BACK BUTTON FIX */}
      <BackButton fallback="/" />

      <Row className="justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center fw-bold mb-4">
                Welcome Back
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

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Logging in…
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <small>
                  Forgot your password?{" "}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => setShowModal(true)}
                  >
                    Reset here
                  </Button>
                </small>
              </div>

              <div className="text-center mt-2">
                <small>
                  Don’t have an account?{" "}
                  <Link to="/signup">Sign Up</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PASSWORD RESET MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Password Reset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordReset}>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 mt-3"
              disabled={resetLoading}
            >
              {resetLoading ? "Sending…" : "Send Reset Link"}
            </Button>
          </Form>

          {resetMsg && (
            <Alert
              className="mt-3"
              variant={
                resetMsg.startsWith("✅") ? "success" : "danger"
              }
            >
              {resetMsg}
            </Alert>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
