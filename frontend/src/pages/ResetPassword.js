import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
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
      <Container className="py-5" style={{ maxWidth: 500 }}>
        <Alert variant="danger">
          Invalid or broken password reset link.
        </Alert>
      </Container>
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
      setMsg({ type: "danger", text: `⚠️ ${validationError}` });
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
          text: "✅ Password reset successfully! Redirecting…",
        });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg({
          type: "danger",
          text:
            data.detail ||
            "⚠️ Invalid or expired password reset link.",
        });
      }
    } catch (err) {
      console.error(err);
      setMsg({
        type: "danger",
        text: "⚠️ Server error. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // RENDER
  // =============================
  return (
    <Container className="py-5" style={{ maxWidth: 500 }}>
      <BackButton />

      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="fw-bold mb-3 text-center">
            🔐 Reset Password
          </h3>

          {msg.text && (
            <Alert variant={msg.type}>{msg.text}</Alert>
          )}

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Updating…
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
