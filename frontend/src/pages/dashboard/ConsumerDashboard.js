// src/pages/consumer/ConsumerDashboard.jsx
import { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
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

import { AuthContext } from "../../auth/AuthContext";

import IssueMap from "../../components/issuemap";
import SubmitIssue from "../submitissue";
import BackButton from "../../components/BackButton";

export default function ConsumerDashboard() {
  const { authedFetch, user, loading: authLoading } =
    useContext(AuthContext);

  const [myIssues, setMyIssues] = useState([]);
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // Load consumer data (SAFE)
  // =====================================================
  const loadData = useCallback(async () => {
    if (!user || user.role !== "consumer") return;

    setLoading(true);
    setError("");

    try {
      const [myRes, nearbyRes] = await Promise.all([
        authedFetch("/reports/consumer/issues/"),
        authedFetch("/reports/consumer/issues/?nearby=true"),
      ]);

      if (!myRes.ok || !nearbyRes.ok) {
        throw new Error("API failed");
      }

      const myData = await myRes.json();
      const nearbyData = await nearbyRes.json();

      setMyIssues(Array.isArray(myData) ? myData : myData.results || []);
      setNearbyIssues(
        Array.isArray(nearbyData)
          ? nearbyData
          : nearbyData.results || []
      );
    } catch {
      setError("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }, [authedFetch, user]);

  // =====================================================
  // After submit
  // =====================================================
  const handleIssueSubmitted = (issue) => {
    setMyIssues((prev) => [issue, ...prev]);
  };

  // =====================================================
  // Mount AFTER auth is ready
  // =====================================================
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "consumer") return;

    loadData();
  }, [authLoading, user, loadData]);

  // =====================================================
  // Render guards
  // =====================================================
  if (authLoading || loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user || user.role !== "consumer") {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          You are not authorized to view this page.
        </Alert>
      </Container>
    );
  }

  // =====================================================
  // Render
  // =====================================================
  return (
    <Container className="py-4">
      <BackButton />

      <Row className="justify-content-between align-items-center mb-4">
        <Col>
          <h1 className="h2 fw-bold">📋 My Dashboard</h1>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/profile">
            Profile
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* SUBMIT ISSUE */}
      <Card className="mb-4">
        <Card.Body>
          <h5>➕ Report a New Issue</h5>
          <SubmitIssue onSubmitted={handleIssueSubmitted} />
        </Card.Body>
      </Card>

      {/* MY ISSUES */}
      <h4 className="mb-3">📌 Issues I Reported</h4>

      {myIssues.length === 0 ? (
        <Alert variant="info">
          You haven’t reported any issues yet.
        </Alert>
      ) : (
        <Row className="mb-5">
          {myIssues.map((issue) => (
            <Col md={6} lg={4} key={issue.id} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{issue.title}</Card.Title>

                  <div className="small mb-2">
                    <strong>Status:</strong>{" "}
                    <Badge bg="secondary">{issue.status}</Badge>
                  </div>

                  <div className="small mb-2">
                    <strong>Priority:</strong>{" "}
                    <Badge bg="warning">{issue.priority}</Badge>
                  </div>

                  <div className="small">
                    <strong>Last Update:</strong>{" "}
                    {new Date(issue.updated_at).toLocaleString()}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* MAP */}
      <h4 className="mb-3">🗺️ Nearby Reported Issues</h4>
      <IssueMap issues={nearbyIssues} />
    </Container>
  );
}
