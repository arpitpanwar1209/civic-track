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

    <Container className="py-4">

      <BackButton fallback="/" />

      <Row className="justify-content-center">

        <Col md={6} lg={5} xl={4}>

          <Card className="shadow-sm">

            <Card.Body className="p-4 p-md-5">

              <h2 className="text-center fw-bold mb-4">
                Welcome Back
              </h2>

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

                <Form.Group className="mb-4">

                  <Form.Label>Password</Form.Label>

                  <InputGroup>

                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />

                    <Button
                      variant="outline-secondary"
                      onClick={() =>
                        setShowPassword(prev => !prev)
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>

                  </InputGroup>

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
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}

                </Button>

              </Form>

              <div className="text-center mt-3">

                <small>

                  Forgot password?{" "}

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

      {/* ================= PASSWORD RESET MODAL ================= */}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>

        <Modal.Header closeButton>
          <Modal.Title>Password Reset</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form onSubmit={handlePasswordReset}>

            <Form.Group>

              <Form.Label>Email</Form.Label>

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

              {resetLoading ? "Sending..." : "Send Reset Link"}

            </Button>

          </Form>

          {resetMsg && (
            <Alert className="mt-3">
              {resetMsg}
            </Alert>
          )}

        </Modal.Body>

      </Modal>

    </Container>

  );

}