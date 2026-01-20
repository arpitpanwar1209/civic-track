// src/pages/provider/ProducerDashboard.jsx
import { useEffect, useState, useContext, useCallback } from "react";
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

export default function ProducerDashboard() {
  const { authedFetch, user, loading: authLoading } =
    useContext(AuthContext);

  const [assignedIssues, setAssignedIssues] = useState([]);
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =====================================================
  // Load dashboard data (SAFE)
  // =====================================================
  const loadData = useCallback(
    async (signal) => {
      if (!user || user.role !== "provider") return;

      setLoading(true);
      setError(null);

      try {
        const [assignedRes, nearbyRes] = await Promise.all([
          authedFetch("/reports/provider/issues/my-issues/", {
            signal,
          }),
          authedFetch(
            "/reports/provider/issues/nearby/?lat=28.6&lon=77.2&radius=10",
            { signal }
          ),
        ]);

        if (!assignedRes.ok || !nearbyRes.ok) {
          throw new Error("Dashboard API failed");
        }

        const [assignedData, nearbyData] = await Promise.all([
          assignedRes.json(),
          nearbyRes.json(),
        ]);

        setAssignedIssues(assignedData);
        setNearbyIssues(nearbyData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Failed to load provider dashboard.");
        }
      } finally {
        setLoading(false);
      }
    },
    [authedFetch, user]
  );

  // =====================================================
  // Load only AFTER auth is ready AND role is provider
  // =====================================================
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "provider") return;

    const controller = new AbortController();
    loadData(controller.signal);

    return () => controller.abort();
  }, [authLoading, user, loadData]);

  // =====================================================
  // Issue actions (reload safely)
  // =====================================================
  const reload = () => {
    const controller = new AbortController();
    loadData(controller.signal);
  };

  const claimIssue = async (id) => {
    const res = await authedFetch(
      `/reports/provider/issues/${id}/claim/`,
      { method: "POST" }
    );
    if (res.ok) reload();
  };

  const startIssue = async (id) => {
    const res = await authedFetch(
      `/reports/provider/issues/${id}/start/`,
      { method: "POST" }
    );
    if (res.ok) reload();
  };

  const resolveIssue = async (id) => {
    const res = await authedFetch(
      `/reports/provider/issues/${id}/resolve/`,
      { method: "POST" }
    );
    if (res.ok) reload();
  };

  // =====================================================
  // Render
  // =====================================================
  if (authLoading || loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user || user.role !== "provider") {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          You are not authorized to view this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="h3 fw-bold mb-4">🛠️ Provider Dashboard</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* ASSIGNED ISSUES */}
      <h4 className="mb-3">📌 My Assigned Issues</h4>

      {assignedIssues.length === 0 ? (
        <Alert variant="info">No assigned issues.</Alert>
      ) : (
        <Row className="mb-5">
          {assignedIssues.map((issue) => (
            <Col md={6} lg={4} key={issue.id} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{issue.title}</Card.Title>

                  <div className="mb-2">
                    <Badge bg="secondary">{issue.status}</Badge>
                  </div>

                  {issue.status === "assigned" && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => startIssue(issue.id)}
                    >
                      Start Work
                    </Button>
                  )}

                  {issue.status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => resolveIssue(issue.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* NEARBY ISSUES */}
      <h4 className="mb-3">📍 Nearby Open Issues</h4>

      {nearbyIssues.length === 0 ? (
        <Alert variant="info">No nearby issues.</Alert>
      ) : (
        <Row>
          {nearbyIssues.map((issue) => (
            <Col md={6} lg={4} key={issue.id} className="mb-4">
              <Card className="h-100 border-warning">
                <Card.Body>
                  <Card.Title>{issue.title}</Card.Title>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => claimIssue(issue.id)}
                  >
                    Claim Issue
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
