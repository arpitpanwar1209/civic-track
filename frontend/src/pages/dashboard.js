// frontend/src/pages/dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { FaThumbsUp, FaEdit, FaTrash, FaUser, FaCheck, FaHandshake, FaMapMarkerAlt } from "react-icons/fa";
import IssueMap from "../components/issuemap";
import SubmitIssue from "./submitissue";
import BackButton from "../components/BackButton";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export default function Dashboard() {
  const navigate = useNavigate();

  // UI state
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth state
  const [role, setRole] = useState(localStorage.getItem("role") || "consumer");
  const [profession, setProfession] = useState(localStorage.getItem("profession") || "");
  const username = localStorage.getItem("username") || "";

  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  // --------- helpers ----------
  const authHeader = useMemo(
    () => (access ? { Authorization: `Bearer ${access}` } : {}),
    [access]
  );
  
<Container className="py-4">
  <BackButton />
  {/* rest of content */}
</Container>

  const refreshAccessToken = async () => {
    if (!refresh) {
      localStorage.clear();
      navigate("/login");
      return null;
    }
    try {
      const res = await fetch(`${API_URL}/api/token/refresh/`, {
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

  const authedFetch = async (url, opts = {}) => {
    const doFetch = async (token) =>
      fetch(url, {
        ...opts,
        headers: {
          ...(opts.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : authHeader),
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

  // --------- data loaders ----------
  const loadProfile = async () => {
    try {
      const res = await authedFetch(`${API_URL}/api/profile/`, { method: "GET" });
      if (!res.ok) throw new Error(`profile ${res.status}`);
      const data = await res.json();
      // Sync role/profession to localStorage to keep UI consistent after login
      if (data.role) {
        localStorage.setItem("role", data.role);
        setRole(data.role);
      }
      if (data.profession) {
        localStorage.setItem("profession", data.profession);
        setProfession(data.profession);
      }
    } catch (e) {
      console.error("Profile load error:", e);
      // Do not hard fail dashboard if profile misses; show a small notice instead
      setError((prev) => prev || "Failed to fetch profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const loadIssues = async () => {
    setLoading(true);
    try {
      const res = await authedFetch(`${API_URL}/api/issues/`, { method: "GET" });
      if (!res.ok) {
        const text = await res.text();
        console.error("Issues error:", text);
        throw new Error(`issues ${res.status}`);
      }
      const data = await res.json();
      setIssues(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      console.error("Issues fetch error:", e);
      setError("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  };

  // --------- actions ----------
  const handleLike = async (id) => {
    try {
      const res = await authedFetch(`${API_URL}/api/issues/${id}/like/`, { method: "POST" });
      if (!res.ok) return;
      const upd = await res.json();
      setIssues((prev) =>
        prev.map((i) => (i.id === id ? { ...i, likes_count: upd.likes_count } : i))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      const res = await authedFetch(`${API_URL}/api/issues/${id}/`, { method: "DELETE" });
      if (res.ok) setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete issue.");
    }
  };

  const handleClaim = async (id) => {
    try {
      const res = await authedFetch(`${API_URL}/api/issues/${id}/claim/`, { method: "POST" });
      if (res.ok) await loadIssues();
      else alert("Unable to claim this issue.");
    } catch (e) {
      console.error(e);
      alert("Error claiming issue.");
    }
  };

  const handleMarkResolved = async (id) => {
    try {
      const res = await authedFetch(`${API_URL}/api/issues/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (res.ok) await loadIssues();
      else alert("Unable to mark resolved.");
    } catch (e) {
      console.error(e);
      alert("Error updating status.");
    }
  };

  const handleIssueSubmitted = (newIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
  };

  // --------- effects ----------
  useEffect(() => {
    if (!access || !refresh) {
      navigate("/login");
      return;
    }
    // Load profile first to ensure role/profession are correct,
    // then load issues for the correct view.
    (async () => {
      await loadProfile();
      await loadIssues();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------- render ----------
  const titleForList = role === "provider" ? "🛠️ Issues Needing Your Attention" : "📌 My Issues";

  return (
    <Container className="py-4">
      <Row className="justify-content-between align-items-center mb-4">
        <Col>
          <h1 className="h2 fw-bold d-flex align-items-center gap-2">
            📋 Dashboard
            {role === "provider" && (
              <Badge bg="info" pill title={profession || "Provider"}>
                {profession || "provider"}
              </Badge>
            )}
          </h1>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/profile" variant="primary">
            <FaUser className="me-2" /> Profile
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Consumers can submit issues */}
      {role === "consumer" && (
        <Card className="mb-4 shadow-sm">
          <Card.Body className="p-4">
            <h3 className="h5 mb-3">➕ Submit a New Issue</h3>
            <SubmitIssue onSubmitted={handleIssueSubmitted} />
          </Card.Body>
        </Card>
      )}

      {/* Issues list */}
      <h2 className="h4 mt-4 mb-3">{titleForList}</h2>

      {loading || profileLoading ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading your feed…</p>
        </div>
      ) : issues.length === 0 ? (
        <Alert variant="info">
          {role === "provider"
            ? "No issues match your profession right now."
            : "No issues submitted yet. Be the first to report one!"}
        </Alert>
      ) : (
        <Row>
          {issues.map((issue) => {
            const youAssigned =
              issue.assigned_to && (issue.assigned_to.username === username || issue.assigned_to === username);

            return (
              <Col md={6} lg={4} key={issue.id} className="mb-4">
                <Card className="shadow-sm h-100">
                  {issue.photo && (
                    <Card.Img
                      variant="top"
                      src={`${API_URL}${issue.photo}`}
                      style={{ height: 200, objectFit: "cover" }}
                      alt={issue.title}
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fw-bold d-flex align-items-center gap-2">
                      {issue.title}
                      {youAssigned && (
                        <Badge bg="secondary" title="Assigned to you">
                          <FaHandshake className="me-1" />
                          yours
                        </Badge>
                      )}
                    </Card.Title>

                    <Card.Subtitle className="mb-2 text-muted small">
                      <strong>Priority:</strong> {issue.priority} · <strong>Status:</strong>{" "}
                      <Badge bg={issue.status === "resolved" ? "success" : issue.status === "in_progress" ? "warning" : "secondary"}>
                        {issue.status}
                      </Badge>
                    </Card.Subtitle>

                    <div className="small mb-2">
                      <div>
                        <strong>Reported by:</strong> {issue.reporter_name || "Anonymous"}
                      </div>
                      {issue.location && (
                        <div className="d-flex align-items-center gap-1">
                          <FaMapMarkerAlt /> <span>{issue.location}</span>
                        </div>
                      )}
                      {typeof issue.distance_km === "number" && (
                        <div className="text-muted">~{issue.distance_km} km away</div>
                      )}
                      <div className="text-muted">
                        ⏰ {issue.created_at ? new Date(issue.created_at).toLocaleString() : ""}
                      </div>
                    </div>

                    <div className="mb-3">👍 {issue.likes_count || 0} likes</div>

                    {/* actions */}
                    <div className="mt-auto">
                      <div className="d-flex flex-wrap gap-2">
                        <Button variant="success" size="sm" onClick={() => handleLike(issue.id)}>
                          <FaThumbsUp className="me-1" /> Like
                        </Button>

                        {role === "consumer" && (
                          <>
                            <Button as={Link} to={`/issues/${issue.id}/edit`} variant="warning" size="sm">
                              <FaEdit className="me-1" /> Edit
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(issue.id)}>
                              <FaTrash className="me-1" /> Delete
                            </Button>
                          </>
                        )}

                        {role === "provider" && (
                          <>
                            {!issue.assigned_to && issue.status !== "resolved" && (
                              <Button className="flex-fill" variant="info" size="sm" onClick={() => handleClaim(issue.id)}>
                                <FaHandshake className="me-1" />
                                Claim
                              </Button>
                            )}

                            {youAssigned && issue.status !== "resolved" && (
                              <Button className="flex-fill" variant="success" size="sm" onClick={() => handleMarkResolved(issue.id)}>
                                <FaCheck className="me-1" /> Mark Resolved
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Map */}
      <div className="mt-5">
        <h2 className="h4">🗺️ View Issues on Map</h2>
        <IssueMap issues={issues} />
      </div>
    </Container>
  );
}
