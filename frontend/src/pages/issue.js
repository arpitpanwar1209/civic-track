// src/pages/IssueList.jsx

import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Spinner, Alert, Badge } from "react-bootstrap";

import BackButton from "../components/BackButton";
import IssueCard from "../components/IssueCard";

import { AuthContext } from "../auth/AuthContext";

export default function IssueList() {
  const { authedFetch, user } = useContext(AuthContext);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ======================================
  // Load issues
  // ======================================
  useEffect(() => {
    const loadIssues = async () => {
      if (!user?.role) {
        setError("System Error: Invalid user role detected.");
        setLoading(false);
        return;
      }

      const endpoint =
        user.role === "consumer"
          ? "/reports/consumer/issues/"
          : "/reports/provider/issues/";

      try {
        const res = await authedFetch(endpoint);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setIssues(Array.isArray(data) ? data : data.results || []);
      } catch {
        setError("Unable to connect to the database to load issues.");
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [user, authedFetch]);

  // ======================================
  // Provider Actions
  // ======================================
  const reload = async () => {
    setLoading(true);

    try {
      const endpoint =
        user.role === "consumer"
          ? "/reports/consumer/issues/"
          : "/reports/provider/issues/";

      const res = await authedFetch(endpoint);
      const data = await res.json();

      setIssues(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Unable to refresh the data feed.");
    } finally {
      setLoading(false);
    }
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

  // ======================================
  // Render Guards
  // ======================================
  if (loading) {
    return (
      <Container className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-4" />
        <h5 className="text-muted fw-bold tracking-wide">FETCHING RECORDS...</h5>
      </Container>
    );
  }

  // ======================================
  // Render
  // ======================================
  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* ================================== */}
      {/* HIGH-CONTRAST HEADER */}
      {/* ================================== */}
      <div className="bg-dark text-white py-4 mb-5 shadow-sm">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div className="d-flex align-items-center gap-3">
              <BackButton />
              <div>
                <h1 className="h3 mb-1 fw-bolder tracking-tight">
                  {user?.role === "provider" ? "CivicTrack Active Feed" : "My Issue Log"}
                </h1>
                <p className="text-secondary mb-0 small text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                  User Session: {user?.username || "Active"}
                </p>
              </div>
            </div>
            <div className="mt-3 mt-md-0">
              <Badge bg="primary" className="px-3 py-2 fs-6 rounded-pill shadow-sm">
                {issues.length} Records Found
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

        {issues.length === 0 && !error ? (
          <div 
            className="text-center py-5 rounded-4 mb-5 mt-4" 
            style={{ backgroundColor: '#f1f3f5', border: '2px dashed #dee2e6' }}
          >
            <p className="text-secondary mb-0 fw-medium fs-5">No records currently found in the database.</p>
            <p className="text-muted small mt-1">When issues are assigned or reported, they will populate here.</p>
          </div>
        ) : (
          <Row className="g-4 mb-5">
            {issues.map((issue) => (
              <Col md={6} lg={4} key={issue.id}>
                <div className="h-100 shadow-sm rounded-4 transition-hover bg-white border border-light">
                  <IssueCard
                    issue={issue}
                    API_URL=""
                    role={user.role}
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