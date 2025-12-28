import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";

/**
 * Backend base = http://host/api/v1
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access");

  // --------------------------------------------------
  // Load nearby issues
  // --------------------------------------------------
  const loadNearbyIssues = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    const successCallback = async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `${API_BASE}/reports/issues/?nearby=${latitude},${longitude}&radius_km=5`,
          token
            ? {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            : {}
        );

        if (!res.ok) throw new Error("Failed to fetch nearby issues.");

        const data = await res.json();
        setIssues(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load nearby issues.");
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    const errorCallback = (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        setError("Enable location access to view nearby issues.");
      } else {
        setError("Unable to determine your location.");
      }
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback
    );
  };

  useEffect(() => {
    loadNearbyIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <div className="home-wrapper">
      {/* HERO */}
      <div className="hero-section shadow-sm">
        <div className="topbar d-flex justify-content-between align-items-center px-3 py-3">
          <h2 className="brand">
            <Link to="/" className="brand-link">
              CivicTrack <span className="rocket">🚀</span>
            </Link>
          </h2>
          <div className="menu-icon">☰</div>
        </div>

        <Container className="text-center py-5">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            MAKE YOUR COMMUNITY BETTER,
            <br />
            ONE REPORT AT A TIME
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Report potholes, street light failures, garbage issues and
            more — help your neighborhood stay safer and better.
          </motion.p>

          <motion.div
            className="mt-4 d-flex justify-content-center gap-3 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button
              as={Link}
              to="/issues/submit"
              variant="primary"
              size="lg"
              className="cta-btn"
            >
              REPORT AN ISSUE
            </Button>

            <Button
              as={Link}
              to="/issues"
              variant="outline-primary"
              size="lg"
              className="cta-btn"
            >
              EXPLORE ISSUES
            </Button>
          </motion.div>

          <motion.img
            src="/illustration-city.png"
            alt="city"
            className="hero-illustration"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
          />
        </Container>
      </div>

      {/* NEARBY ISSUES */}
      <Container className="py-4">
        <h3 className="section-title">📍 Issues Near You</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2">Detecting nearby issues...</p>
          </div>
        ) : !error && issues.length === 0 ? (
          <Alert variant="info">
            No issues found near your location.
          </Alert>
        ) : (
          <div className="issue-list">
            {issues.map((i) => (
              <motion.div
                key={i.id}
                className="issue-card shadow-sm"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  to={`/issues/${i.id}`}
                  className="issue-card-link"
                >
                  <h5>{i.title}</h5>
                  <p className="small text-muted">
                    {i.category ||
                      i.predicted_category ||
                      "Other"}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Container>

      {/* FOOTER */}
      <footer className="footer-section">
        <Container>
          <Row>
            <Col md={4}>
              <h5>Navigation</h5>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/issues">Explore Issues</Link></li>
                <li><Link to="/issues/submit">Report Issue</Link></li>
              </ul>
            </Col>

            <Col md={4}>
              <h5>Resources</h5>
              <ul>
                <li><Link to="/resources/authorities">Local Authorities</Link></li>
                <li><Link to="/resources/safety">Safety Tips</Link></li>
                <li><Link to="/resources/guidelines">Community Guidelines</Link></li>
              </ul>
            </Col>

            <Col md={4}>
              <h5>Legal</h5>
              <ul>
                <li><Link to="/legal/privacy">Privacy Policy</Link></li>
                <li><Link to="/legal/terms">Terms & Conditions</Link></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </Col>
          </Row>

          <p className="text-center mt-3">
            © 2025 CivicTrack. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}
