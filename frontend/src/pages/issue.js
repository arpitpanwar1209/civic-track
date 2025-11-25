import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { Container, Spinner, Alert, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export default function IssueList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const access = localStorage.getItem("access");

  useEffect(() => {
    async function loadIssues() {
      try {
        const res = await fetch(`${API_URL}/api/issues/`, {
          headers: access ? { Authorization: `Bearer ${access}` } : {}
        });

        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        const data = await res.json();
        setIssues(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Unable to load issues.");
      } finally {
        setLoading(false);
      }
    }

    loadIssues();
  }, [access]);

  return (
    <Container className="py-4">
      <BackButton />

      <h2 className="fw-bold mb-4">📝 All Reported Issues</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <Alert variant="info">No issues found.</Alert>
      ) : (
        <ListGroup>
          {issues.map((issue) => (
            <ListGroup.Item
              as={Link}
              to={`/issues/${issue.id}`}
              key={issue.id}
              className="d-flex flex-column"
              style={{ cursor: "pointer" }}
            >
              <strong>{issue.title}</strong>

              <small className="text-muted">
                {issue.category || issue.predicted_category || "Other"} •{" "}
                {issue.status || "unknown"} •{" "}
                {issue.priority || "normal"}
              </small>

              {typeof issue.distance_km === "number" && (
                <span className="text-muted small">
                  📍 {issue.distance_km} km away
                </span>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}
