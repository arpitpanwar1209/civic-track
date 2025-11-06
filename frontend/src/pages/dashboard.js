import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SubmitIssue from "./submitissue";
import IssueMap from "../components/issuemap";
import { FaThumbsUp, FaEdit, FaTrash, FaUser } from "react-icons/fa";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  const accessToken = localStorage.getItem("access");
  const refreshToken = localStorage.getItem("refresh");

  // 🔁 Helper to refresh JWT tokens
  const refreshAccessToken = async () => {
    if (!refreshToken) {
      console.warn("No refresh token found. Redirecting to login...");
      navigate("/login");
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!res.ok) throw new Error("Failed to refresh token");
      const data = await res.json();
      localStorage.setItem("access", data.access);
      return data.access;
    } catch (err) {
      console.error("Token refresh failed:", err);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/login");
      return null;
    }
  };

  // 🔍 Fetch Issues
  const fetchIssues = async (tokenToUse) => {
    try {
      const res = await fetch(`${API_URL}/api/issues/`, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          Accept: "application/json",
        },
      });

      // If token expired, refresh it
      if (res.status === 401) {
        console.warn("Access token expired — refreshing...");
        const newToken = await refreshAccessToken();
        if (newToken) return fetchIssues(newToken);
        else return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("API Error Response:", text);
        throw new Error(`Failed to fetch issues: ${res.status}`);
      }

      const data = await res.json();
      setIssues(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("Failed to fetch issues. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchIssues(accessToken);
    else {
      setError("You must be logged in to view the dashboard.");
      setLoading(false);
    }
  }, []);

  // ❌ Delete Issue
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      const res = await fetch(`${API_URL}/api/issues/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) return handleDelete(id);
      }

      if (!res.ok) throw new Error("Failed to delete issue");
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Error deleting issue:", err);
      setError("Failed to delete the issue.");
    }
  };

  // 👍 Like Issue
  const handleLike = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/issues/${id}/like/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) return handleLike(id);
      }

      if (!res.ok) throw new Error("Failed to update like status.");
      const updatedIssue = await res.json();
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id
            ? { ...issue, likes_count: updatedIssue.likes_count }
            : issue
        )
      );
    } catch (err) {
      console.error("Error liking issue:", err);
      setError("Failed to update like status.");
    }
  };

  // 🆕 Add newly submitted issue instantly
  const handleIssueSubmitted = (newIssue) => {
    setIssues((prevIssues) => [newIssue, ...prevIssues]);
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-between align-items-center mb-4">
        <Col>
          <h1 className="h2 fw-bold">📋 Dashboard</h1>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/profile" variant="primary">
            <FaUser className="me-2" /> Profile
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-5 shadow-sm">
        <Card.Body className="p-4">
          <Card.Title as="h2" className="h4 mb-3">
            ➕ Submit a New Issue
          </Card.Title>
          <SubmitIssue onSubmitted={handleIssueSubmitted} />
        </Card.Body>
      </Card>

      <div className="mb-5">
        <h2 className="h4 mb-3">🗺️ Issues on Map</h2>
        <IssueMap issues={issues} />
      </div>

      <h2 className="h4 mb-4">📌 My Issues</h2>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <Alert variant="info">
          No issues submitted yet. Be the first to report one!
        </Alert>
      ) : (
        <Row>
          {issues.map((issue) => (
            <Col md={6} lg={4} key={issue.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                {issue.photo && (
                  <Card.Img
                    variant="top"
                    src={`${API_URL}${issue.photo}`}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <Card.Body>
                  <Card.Title className="fw-bold">{issue.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    <strong>Priority:</strong> {issue.priority} |{" "}
                    <strong>Status:</strong> {issue.status}
                  </Card.Subtitle>
                  <Card.Text as="div" className="small">
                    <p className="mb-1">
                      <strong>Reported by:</strong>{" "}
                      {issue.reporter_name || "Anonymous"}
                    </p>
                    <p className="mb-1">
                      <strong>Location:</strong>{" "}
                      {issue.location || "Not specified"}
                    </p>
                    <p className="text-muted">
                      ⏰ {new Date(issue.created_at).toLocaleString()}
                    </p>
                  </Card.Text>
                  <p className="mb-3">👍 {issue.likes_count || 0} likes</p>

                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleLike(issue.id)}
                    >
                      <FaThumbsUp className="me-1" /> Like
                    </Button>
                    <Button
                      as={Link}
                      to={`/issues/${issue.id}/edit`}
                      variant="warning"
                      size="sm"
                    >
                      <FaEdit className="me-1" /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(issue.id)}
                    >
                      <FaTrash className="me-1" /> Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
