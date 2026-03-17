// src/pages/Login.jsx
import { useState, useContext, useEffect } from "react";
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
  InputGroup
} from "react-bootstrap";

import { AuthContext } from "../auth/AuthContext";
import BackButton from "../components/BackButton";
import { apiFetch } from "../utils/client";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function Login() {
  const { setUser, saveTokens, user, loading: authLoading } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // ================= Redirect if logged in =================
  useEffect(() => {
    if (authLoading || !user) return;

    if (user.role === "provider") {
      navigate("/provider/dashboard", { replace: true });
    } else {
      navigate("/consumer/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleChange = (e) =>
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

  // ================= LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Username and password are required.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || "Invalid username or password.");
        return;
      }

      // Save tokens using context
      saveTokens(data.access, data.refresh);

      // Fetch profile
      const profileRes = await apiFetch("/accounts/profile/");

      if (!profileRes.ok) {
        throw new Error("Profile fetch failed");
      }

      const profile = await profileRes.json();
      setUser(profile);
    } catch (err) {
      console.error(err);
      setError("Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= PASSWORD RESET =================
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    setResetMsg("");
    setResetLoading(true);

    try {
      const res = await fetch(`${API_BASE}/accounts/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await res.json();

      setResetMsg(
        res.ok
          ? "Password reset link sent to your email."
          : data.detail || "Unable to send reset email."
      );
    } catch {
      setResetMsg("Server error. Try again later.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column pt-4 pb-5">
      <Container>
        <div className="mb-4">
          <BackButton fallback="/" />
        </div>

        <Row className="justify-content-center mt-2 mt-md-5">
          <Col md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              {/* Optional top accent border */}
              <div className="bg-dark" style={{ height: '6px' }}></div>
              
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4 pb-2">
                  <h2 className="fw-bolder tracking-tight text-dark mb-1">
                    Welcome Back
                  </h2>
                  <p className="text-muted small fw-medium">
                    Sign in to continue to CivicTrack
                  </p>
                </div>

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
                    <Form.Label className="fw-semibold text-dark small text-uppercase d-flex justify-content-between" style={{ letterSpacing: '0.5px' }}>
                      <span>Password</span>
                    </Form.Label>
                    <InputGroup className="shadow-sm rounded-2 overflow-hidden">
                      <Form.Control
                        className="py-2 border-end-0"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                      />
                      <Button
                        variant="light"
                        className="border border-start-0 text-secondary fw-medium px-3"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex="-1"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="dark"
                    className="w-100 py-2 rounded-pill fw-bold shadow-sm mt-2"
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
                        Authenticating...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4 pt-3 border-top border-light">
                  <Button
                    variant="link"
                    className="text-decoration-none text-muted small fw-medium p-0 mb-2 transition-hover"
                    onClick={() => setShowModal(true)}
                  >
                    Forgot your password?
                  </Button>
                  <p className="small text-dark fw-medium mb-0 mt-2">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="text-primary text-decoration-none fw-bold transition-hover">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ================= PASSWORD RESET MODAL ================= */}
        <Modal 
          show={showModal} 
          onHide={() => setShowModal(false)} 
          centered
          contentClassName="border-0 shadow rounded-4"
        >
          <Modal.Header closeButton className="border-bottom-0 pb-0 mt-2 mx-2">
            <Modal.Title className="fw-bold">Password Reset</Modal.Title>
          </Modal.Header>

          <Modal.Body className="px-4 pb-4 pt-2">
            <p className="text-muted small mb-4">
              Enter your email address and we will send you a link to reset your password.
            </p>

            <Form onSubmit={handlePasswordReset}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  Email Address
                </Form.Label>
                <Form.Control
                  className="py-2"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="dark"
                className="w-100 py-2 rounded-pill fw-medium shadow-sm"
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Sending Request...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </Form>

            {resetMsg && (
              <Alert 
                variant={resetMsg.includes("sent") ? "success" : "danger"} 
                className={`mt-4 mb-0 border-0 shadow-sm rounded-3 border-start border-4 ${resetMsg.includes("sent") ? 'border-success' : 'border-danger'}`}
              >
                <span className="small fw-medium">{resetMsg}</span>
              </Alert>
            )}
          </Modal.Body>
        </Modal>

      </Container>
    </div>
  );
}