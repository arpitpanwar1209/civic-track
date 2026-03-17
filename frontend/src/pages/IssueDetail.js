// src/pages/IssueDetail.jsx

import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Container, Spinner, Alert, Card, Badge, Row, Col, Image } from "react-bootstrap";

import BackButton from "../components/BackButton";
import { AuthContext } from "../auth/AuthContext";

export default function IssueDetail() {
  const { id } = useParams();
  const { authedFetch, user } = useContext(AuthContext);

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // Helper Functions for Clean UI
  // =====================================================
  const formatStatusVariant = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "resolved" || s === "closed") return "success";
    if (s === "in_progress" || s === "in progress") return "info";
    return "secondary";
  };

  const formatPriorityVariant = (priority) => {
    const p = priority?.toLowerCase() || "";
    if (p === "high" || p === "urgent") return "danger";
    if (p === "medium") return "warning";
    return "dark";
  };

  // =====================================================
  // Load issue data
  // =====================================================
  useEffect(() => {
    const loadIssue = async () => {
      if (!user?.role) {
        setError("System Error: Invalid user role detected.");
        setLoading(false);
        return;
      }

      // Role-Aware Endpoint
      const endpoint =
        user.role === "consumer"
          ? `/reports/consumer/issues/${id}/`
          : `/reports/provider/issues/${id}/`;

      try {
        // FIXED: Now actually using the dynamic endpoint variable instead of the hardcoded consumer string
        const res = await authedFetch(endpoint);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setIssue(data);
      } catch {
        setError("Unable to load issue details. The record may have been moved or deleted.");
      } finally {
        setLoading(false);
      }
    };

    loadIssue();
    // eslint-disable-next-line
  }, [id, user, authedFetch]);

  // =====================================================
  // Render Guards
  // =====================================================
  if (loading) {
    return (
      <Container className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-4" />
        <h5 className="text-muted fw-bold tracking-wide">LOADING RECORD...</h5>
      </Container>
    );
  }

  // =====================================================
  // Render Detail View
  // =====================================================
  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* ================================== */}
      {/* HIGH-CONTRAST HEADER */}
      {/* ================================== */}
      <div className="bg-dark text-white py-4 mb-5 shadow-sm">
        <Container style={{ maxWidth: 800 }}>
          <div className="d-flex align-items-center gap-3">
            <BackButton />
            <div>
              <h1 className="h3 mb-1 fw-bolder tracking-tight">Record Details</h1>
              <p className="text-secondary mb-0 small text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                System ID: {id}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container style={{ maxWidth: 800 }}>
        
        {error ? (
          <Alert variant="danger" className="border-0 shadow-sm mb-4 rounded-3 border-start border-danger border-4">
            <span className="fw-medium">{error}</span>
          </Alert>
        ) : issue ? (
          <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            
            {/* Top Status Banner */}
            <div className={`py-2 px-4 bg-${formatStatusVariant(issue.status)} text-white d-flex justify-content-between align-items-center`}>
              <span className="fw-bold small text-uppercase tracking-wide" style={{ letterSpacing: '1px' }}>
                Current Status
              </span>
              <Badge bg="light" text="dark" className="rounded-pill px-3 py-1 text-uppercase fw-bold">
                {issue.status?.replace("_", " ")}
              </Badge>
            </div>

            <Card.Body className="p-4 p-md-5">
              
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 pb-3 border-bottom border-light">
                <h2 className="fw-bold text-dark mb-3 mb-md-0 lh-base pe-md-4">
                  {issue.title}
                </h2>
                <div className="d-flex gap-2 shrink-0">
                  <Badge bg="secondary" className="rounded-1 text-uppercase px-2 py-1">
                    {issue.category || "General"}
                  </Badge>
                  {issue.priority && (
                    <Badge bg={formatPriorityVariant(issue.priority)} className="rounded-1 text-uppercase px-2 py-1">
                      {issue.priority} Priority
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h6 className="text-muted small fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                  Description
                </h6>
                <p className="fs-6 text-dark lh-lg mb-0">
                  {issue.description || "No description provided."}
                </p>
              </div>

              {issue.location && (
                <div className="mb-4 p-3 bg-light rounded-3 border-0">
                  <h6 className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                    Reported Location
                  </h6>
                  <p className="mb-0 fw-medium text-dark">{issue.location}</p>
                </div>
              )}

              {/* Photo Evidence Section (If Available) */}
              {issue.photo && (
                <div className="mb-4">
                  <h6 className="text-muted small fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
                    Attached Evidence
                  </h6>
                  <div className="bg-light p-2 rounded-4 border">
                    <Image
                      src={issue.photo}
                      alt="Issue Evidence"
                      fluid
                      rounded
                      className="w-100 shadow-sm"
                      style={{ maxHeight: '400px', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              )}

              {/* Timestamps Footer */}
              <div className="mt-5 pt-3 border-top border-light">
                <Row className="g-3">
                  <Col sm={6}>
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Created</span>
                      <span className="small fw-medium text-dark">
                        {issue.created_at ? new Date(issue.created_at).toLocaleString() : "Unknown"}
                      </span>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Last Updated</span>
                      <span className="small fw-medium text-dark">
                        {issue.updated_at ? new Date(issue.updated_at).toLocaleString() : "Unknown"}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>

            </Card.Body>
          </Card>
        ) : null}
        
      </Container>
    </div>
  );
}