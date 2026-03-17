// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Guards
  // -----------------------------
  if (!uid || !token) {
    return (
      <div className="bg-light min-vh-100 d-flex flex-column pt-5">
        <Container style={{ maxWidth: 600 }}>
          <Alert variant="danger" className="border-0 shadow-sm border-start border-danger border-4 p-4">
            <h5 className="fw-bold mb-1">Invalid Link</h5>
            <p className="mb-0">This password reset link is invalid, broken, or has expired.</p>
          </Alert>
        </Container>
      </div>
    );
  }

  // -----------------------------
  // Validation
  // -----------------------------
  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[0-9!@#$%^&*]/.test(pwd)) {
      return "Password must include a number or special character.";
    }
    return null;
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const submit = async () => {
    setMsg({ type: "", text: "" });

    const validationError = validatePassword(password);
    if (validationError) {
      setMsg({ type: "danger", text: validationError });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/accounts/password-reset-confirm/${uid}/${token}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_password: password }),
        }
      );

      let data = {};
      try {
        data = await res.json();
      } catch {
        /* ignore non-json */
      }

      if (res.ok) {
        setMsg({
          type: "success",
          text: "Password reset successfully. Redirecting to login...",
        });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg({
          type: "danger",
          text: data.detail || "Invalid or expired password reset link.",
        });
      }
    } catch (err) {
      console.error(err);
      setMsg({
        type: "danger",
        text: "Server error. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // RENDER
  // =============================
  return (
    <div className="bg-light min-vh-100 d-flex flex-column pt-4 pb-5">
      <Container>
        <div className="mb-4">
          <BackButton fallback="/login" />
        </div>

        <Row className="justify-content-center mt-2 mt-md-5">
          <Col md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              {/* Top accent border */}
              <div className="bg-dark" style={{ height: "6px" }}></div>

              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4 pb-2">
                  <h2 className="fw-bolder tracking-tight text-dark mb-1">
                    Reset Password
                  </h2>
                  <p className="text-muted small fw-medium">
                    Enter a new secure password for your account
                  </p>
                </div>

                {msg.text && (
                  <Alert
                    variant={msg.type}
                    className={`border-0 shadow-sm mb-4 rounded-3 border-start border-4 ${
                      msg.type === "success" ? "border-success" : "border-danger"
                    }`}
                  >
                    <span className="fw-medium">{msg.text}</span>
                  </Alert>
                )}

                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                >
                  <Form.Group className="mb-4">
                    <Form.Label
                      className="fw-semibold text-dark small text-uppercase"
                      style={{ letterSpacing: "0.5px" }}
                    >
                      New Password
                    </Form.Label>
                    <Form.Control
                      className="py-2"
                      type="password"
                      placeholder="Enter at least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="dark"
                    className="w-100 py-2 rounded-pill fw-bold shadow-sm mt-2 transition-hover"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Updating Securely...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}