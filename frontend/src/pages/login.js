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

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Password Reset Modal
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ---------------- LOGIN ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        setSuccess("✅ Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setError(data.detail || "Invalid username or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- PASSWORD RESET ----------------
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetMsg("");

    try {
      const res = await fetch(`${API_URL}/api/accounts/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }), // ✅ FIXED Line
      });

      const data = await res.json();

      if (res.ok) {
        setResetMsg("✅ Password reset link sent to your email.");
      } else {
        setResetMsg(data.detail || "⚠️ Failed to send password reset email.");
      }
    } catch (err) {
      console.error(err);
      setResetMsg("⚠️ Server error. Please try again.");
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <Row className="w-100">
        <Col md={6} lg={5} xl={4} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center fw-bold mb-4">Welcome Back</h2>

              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              {/* Login Form */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
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
                    placeholder="Enter password"
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Logging In...
                      </>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                </div>
              </Form>

              {/* Reset Password Link */}
              <div className="text-center mt-3">
                <small>
                  Forgot your password?{" "}
                  <Button
                    variant="link"
                    className="p-0 text-decoration-underline"
                    onClick={() => setShowModal(true)}
                  >
                    Reset here
                  </Button>
                </small>
              </div>

              {/* Signup Link */}
              <div className="text-center mt-2">
                <small>
                  Don't have an account? <Link to="/signup">Sign Up</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Reset Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordReset}>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100 mt-3">
              Send Reset Link
            </Button>
          </Form>

          {resetMsg && (
            <Alert
              className="mt-3"
              variant={resetMsg.startsWith("✅") ? "success" : "danger"}
            >
              {resetMsg}
            </Alert>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Login;
