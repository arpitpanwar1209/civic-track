import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import IssueMap from "../components/issuemap";
import { FaThumbsUp, FaEdit, FaTrash, FaUser, FaCheck } from "react-icons/fa";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import SubmitIssue from "./submitissue";

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const accessToken = localStorage.getItem("access");
  const refreshToken = localStorage.getItem("refresh");
  const role = localStorage.getItem("role");

  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!res.ok) throw new Error("Token refresh failed");
      const data = await res.json();
      localStorage.setItem("access", data.access);
      return data.access;
    } catch {
      navigate("/login");
      return null;
    }
  };

  const fetchIssues = async (tokenToUse) => {
    try {
      const res = await fetch(`${API_URL}/api/issues/`, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) return fetchIssues(newToken);
      }

      const data = await res.json();
      setIssues(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchIssues(accessToken);
    else navigate("/login");
  }, []);

  const handleClaim = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/issues/${id}/claim/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) fetchIssues(accessToken);
    } catch {
      alert("Error claiming issue.");
    }
  };

  const handleMarkResolved = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/issues/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (res.ok) fetchIssues(accessToken);
    } catch {
      alert("Error updating status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this issue?")) return;
    await fetch(`${API_URL}/api/issues/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setIssues((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-between align-items-center mb-4">
        <Col><h1 className="h2 fw-bold">📋 Dashboard</h1></Col>
        <Col xs="auto">
          <Button as={Link} to="/profile" variant="primary">
            <FaUser className="me-2" /> Profile
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {role === "consumer" && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h3 className="h5 mb-3">➕ Submit a New Issue</h3>
            <SubmitIssue onSubmitted={(newIssue) => setIssues([newIssue, ...issues])} />
          </Card.Body>
        </Card>
      )}

      <h2 className="h4 mt-4 mb-3">
        {role === "provider" ? "🛠️ Issues Needing Your Attention" : "📌 My Issues"}
      </h2>

      {loading ? (
        <Spinner animation="border" />
      ) : issues.length === 0 ? (
        <Alert>No issues to display.</Alert>
      ) : (
        <Row>
          {issues.map((issue) => (
            <Col md={6} lg={4} key={issue.id} className="mb-4">
              <Card className="shadow-sm h-100">
                {issue.photo && (
                  <Card.Img variant="top" src={`${API_URL}${issue.photo}`} style={{ height: "200px", objectFit: "cover" }} />
                )}
                <Card.Body>
                  <Card.Title>{issue.title}</Card.Title>
                  <p><strong>Status:</strong> {issue.status}</p>
                  {issue.assigned_to && (
                    <p><strong>Assigned To:</strong> {issue.assigned_to_username}</p>
                  )}

                  {role === "provider" && (
                    <>
                      {!issue.assigned_to && (
                        <Button className="w-100 mb-2" variant="info" onClick={() => handleClaim(issue.id)}>
                          Claim Issue
                        </Button>
                      )}
                      {issue.assigned_to && issue.status !== "resolved" && (
                        <Button className="w-100 mb-2" variant="success" onClick={() => handleMarkResolved(issue.id)}>
                          <FaCheck className="me-2" /> Mark as Resolved
                        </Button>
                      )}
                    </>
                  )}

                  {role === "consumer" && (
                    <div className="d-flex gap-2">
                      <Button variant="warning" size="sm" as={Link} to={`/issues/${issue.id}/edit`}>
                        <FaEdit /> Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(issue.id)}>
                        <FaTrash /> Delete
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="mt-5">
        <h2 className="h4">🗺️ View Issues on Map</h2>
        <IssueMap issues={issues} />
      </div>
    </Container>
  );
}
