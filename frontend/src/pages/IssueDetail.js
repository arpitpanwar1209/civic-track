import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Container, Spinner, Alert, Card, Badge } from "react-bootstrap";

import { AuthContext } from "../auth/AuthContext";

export default function IssueDetail() {
  const { id } = useParams();
  const { authedFetch, user } = useContext(AuthContext);

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIssue = async () => {
      if (!user?.role) {
        setError("Invalid user role.");
        setLoading(false);
        return;
      }

      // 🔥 ROLE-AWARE ENDPOINT (FIX)
      const endpoint =
        user.role === "consumer"
          ? `/reports/consumer/${id}/`
          : `/reports/provider/${id}/`;

      try {
        const res = await authedFetch(`/reports/consumer/issues/${id}/`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setIssue(data);
      } catch {
        setError("Unable to load issue details.");
      } finally {
        setLoading(false);
      }
    };

    loadIssue();
    // eslint-disable-next-line
  }, [id, user]);

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="fw-bold mb-1">{issue.title}</h3>

          <div className="mb-2">
            <Badge bg="secondary" className="me-2">
              {issue.category || "other"}
            </Badge>

            <Badge
              bg={
                issue.status === "resolved"
                  ? "success"
                  : issue.status === "in_progress"
                  ? "warning"
                  : "secondary"
              }
            >
              {issue.status}
            </Badge>
          </div>

          <p className="mt-3">{issue.description}</p>
        </Card.Body>
      </Card>
    </Container>
  );
}
