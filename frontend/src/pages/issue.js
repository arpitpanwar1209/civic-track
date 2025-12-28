import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import {
  Container,
  Spinner,
  Alert,
  ListGroup,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";

/**
 * Backend base = http://host/api/v1
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function IssueList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const access = localStorage.getItem("access");

  useEffect(() => {
    async function loadIssues() {
      try {
        const res = await fetch(
          `${API_BASE}/reports/issues/`,
          {
            headers: access
              ? { Authorization: `Bearer ${access}` }
              : {},
          }
        );

        if (!res.ok) {
          throw new Error(`Failed with ${res.status}`);
        }

        const data = await res.json();
        setIssues(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Unable to load reported issues.");
      } finally {
        setLoading(false);
      }
    }

    loadIssues();
  }, [access]);

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <BackButton />

      <h2 className="fw-bold mb-4">📝 All Reported Issues</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
          <p className="mt-2">Loading issues…</p>
        </div>
      ) : issues.length === 0 ? (
        <Alert variant="info">
          No issues have been reported yet.
        </Alert>
      ) : (
        <ListGroup>
          {issues.map((issue) => (
            <ListGroup.Item
              key={issue.id}
              as={Link}
              to={`/issues/${issue.id}`}
              action
              className="d-flex flex-column gap-1"
            >
              <div className="d-flex justify-content-between align-items-start">
                <strong>{issue.title}</strong>

                <Badge
                  bg={
                    issue.status === "resolved"
                      ? "success"
                      : issue.status === "in_progress"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {issue.status || "unknown"}
                </Badge>
              </div>

              <small className="text-muted">
                {issue.category ||
                  issue.predicted_category ||
                  "Other"}{" "}
                • Priority: {issue.priority || "normal"}
              </small>

              {typeof issue.distance_km === "number" && (
                <small className="text-muted">
                  📍 {issue.distance_km} km away
                </small>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}
