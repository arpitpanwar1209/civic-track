import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Spinner, Alert, Card } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIssue() {
      try {
        const res = await fetch(`${API_URL}/api/v1/reports/issues/${id}/`);
        if (!res.ok) throw new Error("Failed to load issue");
        const data = await res.json();
        setIssue(data);
      } catch (e) {
        setError("Unable to load issue details.");
      } finally {
        setLoading(false);
      }
    }
    loadIssue();
  }, [id]);

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
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="fw-bold">{issue.title}</h3>
          <p className="text-muted">{issue.category}</p>
          <p>{issue.description}</p>
        </Card.Body>
      </Card>
    </Container>
  );
}
