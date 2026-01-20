import React from "react";
import { Link } from "react-router-dom";
import "./home.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import { motion } from "framer-motion";

import HomeHeader from "../components/HomeHeader";

export default function Home() {
  return (
    <div className="home-wrapper">
      {/* ================= HERO ================= */}
      <section className="hero-section">
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

      {/* ================= INFO SECTION ================= */}
      <section className="issues-section">
        <Container>
          <h3 className="section-title">Why CivicTrack?</h3>

          <Row className="g-4 mt-3">
            <Col md={4}>
              <h5>📍 Local Issues</h5>
              <p className="text-muted">
                Report problems in your area and track their resolution.
              </p>
            </Col>

            <Col md={4}>
              <h5>🛠️ Faster Resolution</h5>
              <p className="text-muted">
                Authorities get clear, actionable reports.
              </p>
            </Col>

            <Col md={4}>
              <h5>🤝 Community Driven</h5>
              <p className="text-muted">
                Citizens and providers collaborate transparently.
              </p>
            </Col>
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
