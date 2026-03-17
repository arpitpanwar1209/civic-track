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
  const { authedFetch, user, loading: authLoading } = useContext(AuthContext);

  const [myIssues, setMyIssues] = useState([]);
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // Helper Functions for Clean UI
  // =====================================================
  const formatStatusVariant = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "resolved" || s === "closed") return "success";
    if (s === "in progress") return "info";
    return "secondary";
  };

  const formatPriorityVariant = (priority) => {
    const p = priority?.toLowerCase() || "";
    if (p === "high") return "danger";
    if (p === "medium") return "warning";
    return "dark";
  };

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
        Array.isArray(nearbyData) ? nearbyData : nearbyData.results || []
      );
    } catch {
      setError("Unable to load dashboard data. Please try again later.");
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
      <Container className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-4" />
        <h5 className="text-muted fw-bold tracking-wide">AUTHENTICATING SESSION...</h5>
      </Container>
    );
  }

  if (!user || user.role !== "consumer") {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="border-0 shadow-sm border-start border-danger border-5">
          <h5 className="fw-bold mb-1">Access Denied</h5>
          <p className="mb-0">You must be logged in as a consumer to view this page.</p>
        </Alert>
      </Container>
    );
  }

  // =====================================================
  // Render
  // =====================================================
  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* ================================== */}
      {/* HIGH-CONTRAST HEADER */}
      {/* ================================== */}
      <div className="bg-dark text-white py-4 mb-5 shadow-sm">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div className="d-flex align-items-center mb-3 mb-md-0 gap-3">
              <BackButton />
              <div>
                <h1 className="h3 mb-1 fw-bolder tracking-tight">Consumer Portal</h1>
                <p className="text-secondary mb-0 small text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                  User Session: {user.username || "Active"}
                </p>
              </div>
            </div>
            <div className="mt-3 mt-md-0 d-flex gap-2">
              <Button as={Link} to="/profile" variant="outline-light" className="px-4 py-2 fw-medium rounded-pill shadow-sm">
                Manage Profile
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {error && (
          <Alert variant="danger" className="border-0 shadow-sm mb-4 rounded-3 border-start border-danger border-4">
            <span className="fw-medium">{error}</span>
          </Alert>
        )}

        {/* ================================== */}
        {/* TOP ROW: Actions & Map */}
        {/* ================================== */}
        <Row className="g-4 mb-5">
          
          {/* SUBMIT ISSUE */}
          <Col lg={5}>
            <Card className="h-100 border-0 shadow-sm rounded-4 bg-white">
              <Card.Body className="p-4 pb-5">
                <div className="d-flex align-items-center mb-4">
                  <h5 className="fw-bold text-dark mb-0 me-3">Report an Issue</h5>
                  <Badge bg="primary" className="rounded-pill">New</Badge>
                </div>
                <SubmitIssue onSubmitted={handleIssueSubmitted} />
              </Card.Body>
            </Card>
          </Col>

          {/* MAP */}
          <Col lg={7}>
            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold text-dark mb-0">Nearby Activity</h5>
                <Badge bg="light" text="dark" className="border fw-medium">
                  Live View
                </Badge>
              </div>
              <div className="bg-light position-relative" style={{ minHeight: "350px", height: "100%" }}>
                <IssueMap issues={nearbyIssues} />
              </div>
            </Card>
          </Col>
        </Row>

        {/* ================================== */}
        {/* BOTTOM SECTION: MY ISSUES */}
        {/* ================================== */}
        <div className="d-flex align-items-center mb-4 mt-5">
          <h4 className="fw-bolder text-dark mb-0 me-3">My Reported Issues</h4>
          <span className="badge bg-primary rounded-pill px-3 py-2 shadow-sm">
            {myIssues.length}
          </span>
        </div>

        {myIssues.length === 0 ? (
          <div 
            className="text-center py-5 rounded-4 mb-5" 
            style={{ backgroundColor: '#f1f3f5', border: '2px dashed #dee2e6' }}
          >
            <p className="text-secondary mb-0 fw-medium fs-5">You haven't reported any issues yet.</p>
            <p className="text-muted small mt-1">Use the form above to submit a new report.</p>
          </div>
        ) : (
          <Row className="g-4 mb-5">
            {myIssues.map((issue) => (
              <Col md={6} lg={4} key={issue.id}>
                <Card className="h-100 shadow-sm rounded-4 transition-hover bg-white border border-light">
                  <Card.Body className="p-4 d-flex flex-column">
                    
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Card.Title className="h6 fw-bold mb-0 text-dark pe-3 lh-base">
                        {issue.title}
                      </Card.Title>
                      <Badge bg={formatPriorityVariant(issue.priority)} className="rounded-1">
                        {issue.priority}
                      </Badge>
                    </div>

                    <div className="mt-auto pt-3 border-top border-light mt-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Status</span>
                        <Badge bg={formatStatusVariant(issue.status)} className="rounded-1 text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "0.65rem" }}>
                          {issue.status}
                        </Badge>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Updated</span>
                        <span className="small fw-medium text-dark">
                          {new Date(issue.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}