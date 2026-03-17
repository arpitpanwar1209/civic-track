// src/pages/provider/ProviderDashboard.jsx

import { useEffect, useState, useContext, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
  Badge
} from "react-bootstrap";

import { AuthContext } from "../../auth/AuthContext";
import IssueCard from "../../components/IssueCard";
import IssueMap from "../../components/issuemap";

export default function ProviderDashboard() {
  const { authedFetch, user, loading: authLoading } = useContext(AuthContext);

  const [assignedIssues, setAssignedIssues] = useState([]);
  const [nearbyIssues, setNearbyIssues] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [location, setLocation] = useState(null);

  // ==========================================
  // Get provider location
  // ==========================================
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        // fallback location
        setLocation({ lat: 28.6139, lon: 77.209 });
      }
    );
  }, []);

  // ==========================================
  // Load dashboard data
  // ==========================================
  const loadData = useCallback(
    async (signal) => {
      if (!user || user.role !== "provider" || !location) return;

      setLoading(true);
      setError(null);

      try {
        const [assignedRes, nearbyRes] = await Promise.all([
          authedFetch("/reports/provider/issues/my-issues/", {
            signal,
          }),

          authedFetch(
            `/reports/provider/issues/nearby/?lat=${location.lat}&lon=${location.lon}&radius=10`,
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
    [authedFetch, user, location]
  );

  // ==========================================
  // Load after auth ready
  // ==========================================
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "provider") return;
    if (!location) return;

    const controller = new AbortController();
    loadData(controller.signal);

    return () => controller.abort();
  }, [authLoading, user, location, loadData]);

  // ==========================================
  // Actions
  // ==========================================
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

  // ==========================================
  // Render Guards (Loading & Auth)
  // ==========================================
  if (authLoading || loading) {
    return (
      <Container className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-4" />
        <h5 className="text-muted fw-bold tracking-wide">AUTHENTICATING WORKSPACE...</h5>
      </Container>
    );
  }

  if (!user || user.role !== "provider") {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="border-0 shadow-sm border-start border-danger border-5">
          <h5 className="fw-bold mb-1">Access Denied</h5>
          <p className="mb-0">You must be logged in as a recognized service provider to access this dashboard.</p>
        </Alert>
      </Container>
    );
  }

  // ==========================================
  // Render Dashboard
  // ==========================================
  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* ================================== */}
      {/* HIGH-CONTRAST HEADER */}
      {/* ================================== */}
      <div className="bg-dark text-white py-4 mb-5 shadow-sm">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div>
              <h1 className="h3 mb-1 fw-bolder tracking-tight">Provider Portal</h1>
              <p className="text-secondary mb-0 small text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                Active Session: {user.username}
              </p>
            </div>
            <div className="mt-3 mt-md-0 d-flex gap-2">
              <Badge bg="primary" className="px-3 py-2 fs-6 rounded-pill shadow-sm">
                {assignedIssues.length} Active Tasks
              </Badge>
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
        {/* MAP VIEW */}
        {/* ================================== */}
        <Card className="border-0 shadow-sm rounded-4 mb-5 overflow-hidden">
          <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">Live Territory Map</h5>
            <Badge bg="light" text="dark" className="border fw-medium">
              10km Radius
            </Badge>
          </div>
          <div className="bg-light position-relative" style={{ height: "450px" }}>
            <IssueMap
              issues={nearbyIssues}
              API_URL=""
              role="provider"
              currentUser={user.username}
              onClaim={claimIssue}
              onStart={startIssue}
              onResolve={resolveIssue}
            />
          </div>
        </Card>

        {/* ================================== */}
        {/* ASSIGNED ISSUES */}
        {/* ================================== */}
        <div className="d-flex align-items-center mb-4 mt-5">
          <h4 className="fw-bolder text-dark mb-0 me-3">My Assigned Issues</h4>
          <span className="badge bg-primary rounded-pill px-3 py-2 shadow-sm">
            {assignedIssues.length}
          </span>
        </div>

        {assignedIssues.length === 0 ? (
          <div 
            className="text-center py-5 rounded-4 mb-5" 
            style={{ backgroundColor: '#f1f3f5', border: '2px dashed #dee2e6' }}
          >
            <p className="text-secondary mb-0 fw-medium fs-5">Your queue is currently empty.</p>
            <p className="text-muted small mt-1">Check the map or nearby open issues to claim tasks.</p>
          </div>
        ) : (
          <Row className="g-4 mb-5">
            {assignedIssues.map((issue) => (
              <Col md={6} lg={4} key={issue.id}>
                <div className="h-100 shadow-sm rounded-4 transition-hover bg-white border border-light">
                  <IssueCard
                    issue={issue}
                    API_URL=""
                    role="provider"
                    currentUser={user.username}
                    onStart={startIssue}
                    onResolve={resolveIssue}
                  />
                </div>
              </Col>
            ))}
          </Row>
        )}

        {/* ================================== */}
        {/* NEARBY OPEN ISSUES */}
        {/* ================================== */}
        <div className="d-flex align-items-center mb-4 mt-5">
          <h4 className="fw-bolder text-dark mb-0 me-3">Nearby Open Issues</h4>
          <span className="badge bg-info text-dark rounded-pill px-3 py-2 shadow-sm">
            {nearbyIssues.length}
          </span>
        </div>

        {nearbyIssues.length === 0 ? (
          <div 
            className="text-center py-5 rounded-4 mb-5" 
            style={{ backgroundColor: '#f1f3f5', border: '2px dashed #dee2e6' }}
          >
            <p className="text-secondary mb-0 fw-medium fs-5">No open issues reported nearby.</p>
          </div>
        ) : (
          <Row className="g-4 mb-5">
            {nearbyIssues.map((issue) => (
              <Col md={6} lg={4} key={issue.id}>
                <div className="h-100 shadow-sm rounded-4 transition-hover bg-white border border-light">
                  <IssueCard
                    issue={issue}
                    API_URL=""
                    role="provider"
                    currentUser={user.username}
                    onClaim={claimIssue}
                    onStart={startIssue}
                    onResolve={resolveIssue}
                  />
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}