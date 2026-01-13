import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import HomeHeader from "../components/HomeHeader"; // ✅ ADD THIS

const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access");

  // ==========================
  // FETCH NEARBY ISSUES
  // ==========================
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(
            `${API_BASE}/reports/issues/?nearby=${latitude},${longitude}&radius_km=5`,
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : {}
          );

          if (!res.ok) throw new Error();

          const data = await res.json();
          setIssues(Array.isArray(data) ? data : data.results || []);
        } catch {
          setError("Unable to load nearby issues.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Enable location access to view nearby issues.");
        setLoading(false);
      }
    );
  }, [token]);

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="home-wrapper">
      {/* ================= HERO ================= */}
      <section className="hero-section">
        {/* ✅ HEADER FIX */}
        <HomeHeader />

        <div className="hero-overlay" />

        <Container className="hero-content">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            MAKE YOUR COMMUNITY BETTER,
            <br />
            ONE REPORT AT A TIME
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Report potholes, street light failures, garbage issues and more —
            help your neighborhood stay safer and better.
          </motion.p>

          <div className="hero-actions">
            <Button
              as={Link}
              to="/issues/submit"
              size="lg"
              className="cta-btn primary"
            >
              REPORT AN ISSUE
            </Button>

            <Button
              as={Link}
              to="/issues"
              size="lg"
              className="cta-btn secondary"
            >
              EXPLORE ISSUES
            </Button>
          </div>
        </Container>
      </section>

      {/* ================= NEARBY ISSUES ================= */}
      <section className="issues-section">
        <Container>
          <h3 className="section-title">📍 Issues Near You</h3>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Detecting nearby issues…</p>
            </div>
          )}

          {!loading && !error && issues.length === 0 && (
            <Alert variant="info">No issues found near your location.</Alert>
          )}

          <Row className="g-3">
            {issues.map((issue) => (
              <Col key={issue.id} md={6} lg={4}>
                <Link
                  to={`/issues/${issue.id}`}
                  className="issue-card-link"
                >
                  <div className="issue-card">
                    <h5>{issue.title}</h5>
                    <p className="text-muted small">
                      {issue.category ||
                        issue.predicted_category ||
                        "Other"}
                    </p>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

{/* ================= FOOTER ================= */}
<footer className="footer-section">
  <Container>
    <Row>
      <Col md={4}>
        <h5>Navigation</h5>
        <Link to="/">Home</Link>
        <Link to="/issues">Explore Issues</Link>
        <Link to="/issues/submit">Report Issue</Link>
      </Col>

      <Col md={4}>
        <h5>Resources</h5>
        <Link to="/resources/authorities">Local Authorities</Link>
        <Link to="/resources/safety">Safety Tips</Link>
        <Link to="/resources/guidelines">Community Guidelines</Link>
      </Col>

      <Col md={4}>
        <h5>Legal</h5>
        <Link to="/legal/privacy">Privacy Policy</Link>
        <Link to="/legal/terms">Terms & Conditions</Link>
        <Link to="/about">About Us</Link>
      </Col>
    </Row>

    <p className="text-center mt-4 small">
      © 2025 CivicTrack. All rights reserved.
    </p>
  </Container>
</footer>
    </div>
  );
}
