import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import BackButton from "../components/BackButton";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

/**
 * Backend base = http://host/api/v1
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Submit new password
  // --------------------------------------------------
  const submit = async () => {
    if (!password.trim()) {
      setMsg("⚠️ Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setMsg("⚠️ Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        `${API_BASE}/accounts/password-reset-confirm/${uid}/${token}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_password: password }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMsg("✅ Password reset successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg(
          data.detail ||
            "⚠️ Invalid or expired password reset link."
        );
      }
    } catch (err) {
      console.error(err);
      setMsg("⚠️ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <Container className="py-5" style={{ maxWidth: 500 }}>
      <BackButton />

      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="fw-bold mb-3 text-center">
            🔐 Reset Password
          </h3>

          {msg && (
            <Alert
              variant={msg.startsWith("✅") ? "success" : "danger"}
            >
              {msg}
            </Alert>
          )}

          <Form>
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
              className="w-100"
              variant="primary"
              onClick={submit}
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
