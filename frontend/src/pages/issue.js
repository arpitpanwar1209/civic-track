// frontend/src/pages/Issue.js
import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { Container, Spinner, Alert, ListGroup } from "react-bootstrap";
import { Container } from "react-bootstrap";


// Backend URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function Issue() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/issues/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);
        setIssues(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => {
        console.error("Error fetching issues:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="py-4">
      <BackButton />

      <h2 className="fw-bold mb-4">📝 All Reported Issues</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <Alert variant="info">No issues found.</Alert>
      ) : (
        <ListGroup>
          {issues.map((issue) => (
            <ListGroup.Item key={issue.id}>
              <strong>{issue.title}</strong>
              {issue.priority && ` — Priority: ${issue.priority}`}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}
