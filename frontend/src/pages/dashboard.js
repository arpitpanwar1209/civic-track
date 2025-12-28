import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";

import {
  FaThumbsUp,
  FaEdit,
  FaTrash,
  FaUser,
  FaCheck,
  FaHandshake,
  FaMapMarkerAlt,
} from "react-icons/fa";

import IssueMap from "../components/issuemap";
import SubmitIssue from "./submitissue";
import BackButton from "../components/BackButton";

/**
 * IMPORTANT:
 * Backend base = http://host/api/v1
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function Dashboard() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");

  const [role, setRole] = useState(localStorage.getItem("role") || "consumer");
  const [profession, setProfession] = useState(
    localStorage.getItem("profession") || ""
  );

  const username = localStorage.getItem("username") || "";
  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  const authHeader = useMemo(
    () => (access ? { Authorization: `Bearer ${access}` } : {}),
    [access]
  );

  // ---------------------------------------------------
  // Refresh access token
  // ---------------------------------------------------
  const refreshAccessToken = async () => {
    if (!refresh) {
      localStorage.clear();
      navigate("/login");
      return null;
    }

    try {
      const res = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) throw new Error("refresh failed");

      const data = await res.json();
      localStorage.setItem("access", data.access);
      return data.access;
    } catch {
      localStorage.clear();
      navigate("/login");
      return null;
    }
  };

  // ---------------------------------------------------
  // Authenticated fetch wrapper
  // ---------------------------------------------------
  const authedFetch = async (url, opts = {}) => {
    const doFetch = async (token) =>
      fetch(url, {
        ...opts,
        headers: {
          ...(opts.headers || {}),
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : authHeader),
        },
      });

    let res = await doFetch();
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return res;
      res = await doFetch(newToken);
    }
    return res;
  };

  // ---------------------------------------------------
  // Load profile
  // ---------------------------------------------------
  const loadProfile = async () => {
    try {
      const res = await authedFetch(
        `${API_BASE}/accounts/profile/`,
        { method: "GET" }
      );

      if (!res.ok) throw new Error("profile failed");

      const data = await res.json();

      if (data.role) {
        localStorage.setItem("role", data.role);
        setRole(data.role);
      }

      if (data.profession) {
        localStorage.setItem("profession", data.profession);
        setProfession(data.profession);
      }
    } catch {
      setError("Failed to load profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // ---------------------------------------------------
  // Load issues
  // ---------------------------------------------------
  const loadIssues = async () => {
    setLoading(true);
    try {
      const url =
        role === "provider"
          ? `${API_BASE}/reports/issues/?profession=${profession}`
          : `${API_BASE}/reports/issues/`;

      const res = await authedFetch(url, { method: "GET" });
      if (!res.ok) throw new Error("issues failed");

      const data = await res.json();
      setIssues(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // Like issue
  // ---------------------------------------------------
  const handleLike = async (id) => {
    const res = await authedFetch(
      `${API_BASE}/reports/issues/${id}/like/`,
      { method: "POST" }
    );
    if (!res.ok) return;

    const upd = await res.json();
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, likes_count: upd.likes_count } : i
      )
    );
  };

  // ---------------------------------------------------
  // Delete issue
  // ---------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this issue?")) return;

    const res = await authedFetch(
      `${API_BASE}/reports/issues/${id}/`,
      { method: "DELETE" }
    );

    if (res.ok)
      setIssues((prev) => prev.filter((i) => i.id !== id));
  };

  // ---------------------------------------------------
  // Claim issue (provider)
  // ---------------------------------------------------
  const handleClaim = async (id) => {
    const res = await authedFetch(
      `${API_BASE}/reports/issues/${id}/claim/`,
      { method: "POST" }
    );

    if (res.ok) await loadIssues();
  };

  // ---------------------------------------------------
  // Mark resolved
  // ---------------------------------------------------
  const handleMarkResolved = async (id) => {
    const res = await authedFetch(
      `${API_BASE}/reports/issues/${id}/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      }
    );

    if (res.ok) await loadIssues();
  };

  // ---------------------------------------------------
  // After submit
  // ---------------------------------------------------
  const handleIssueSubmitted = (issue) => {
    setIssues((prev) => [issue, ...prev]);
  };

  // ---------------------------------------------------
  // Mount
  // ---------------------------------------------------
  useEffect(() => {
    if (!access || !refresh) {
      navigate("/login");
      return;
    }

    (async () => {
      await loadProfile();
      await loadIssues();
    })();
    // eslint-disable-next-line
  }, []);

  const title =
    role === "provider"
      ? "🛠️ Issues Needing Your Attention"
      : "📌 My Issues";

  // ===================================================
  // RENDER
  // ===================================================
  return (
    <Container className="py-4">
      <BackButton />

      <Row className="justify-content-between align-items-center mb-4">
        <Col>
          <h1 className="h2 fw-bold">
            📋 Dashboard{" "}
            {role === "provider" && (
              <Badge bg="info">{profession || "provider"}</Badge>
            )}
          </h1>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/profile">
            <FaUser className="me-2" /> Profile
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {role === "consumer" && (
        <Card className="mb-4">
          <Card.Body>
            <h5>➕ Submit Issue</h5>
            <SubmitIssue onSubmitted={handleIssueSubmitted} />
          </Card.Body>
        </Card>
      )}

      <h4 className="mb-3">{title}</h4>

      {loading || profileLoading ? (
        <Spinner animation="border" />
      ) : issues.length === 0 ? (
        <Alert variant="info">No issues found.</Alert>
      ) : (
        <Row>
          {issues.map((issue) => (
            <Col md={6} lg={4} key={issue.id} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{issue.title}</Card.Title>
                  <div className="small mb-2">
                    <strong>Status:</strong> {issue.status}
                  </div>

                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleLike(issue.id)}
                  >
                    <FaThumbsUp /> Like
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="mt-5">
        <h4>🗺️ Map</h4>
        <IssueMap issues={issues} />
      </div>
    </Container>
  );
}
