import React, { useState, useEffect, useContext } from "react";
import BackButton from "../components/BackButton";
import {
  Container,
  Spinner,
  Alert,
  ListGroup,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";

import { AuthContext } from "../auth/AuthContext";

export default function IssueList() {
  const { authedFetch, user } = useContext(AuthContext);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadIssues = async () => {
      if (!user?.role) {
        setError("Invalid user role.");
        setLoading(false);
        return;
      }

      // 🔥 ROLE-BASED ENDPOINT (FIX)
      const endpoint =
        user.role === "consumer"
          ? "/reports/consumer/"
          : "/reports/provider/";

      try {
        const res = await authedFetch(endpoint);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setIssues(Array.isArray(data) ? data : data.results || []);
      } catch {
        setError("Unable to load reported issues.");
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
    // eslint-disable-next-line
  }, [user]);

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <BackButton />

      <h2 className="fw-bold mb-4">
         {user?.role === "producer" ? "Relevant Issues" : "My Issues"}
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
          <p className="mt-2">Loading issues…</p>
        </div>
      ) : issues.length === 0 ? (
        <Alert variant="info">No issues found.</Alert>
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
                   {issue.distance_km} km away
                </small>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}
