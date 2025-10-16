// frontend/src/pages/Home.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTypewriter, Cursor } from "react-simple-typewriter"; // Import for typing effect
import { FaPaperPlane, FaPhone, FaEnvelope } from "react-icons/fa"; // Icons for new sections

// Import a local stylesheet for custom animations
import './home.css';

export default function Home() {
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Animated headline text
  const [headlineText] = useTypewriter({
    words: ['Report Civic Issues.', 'Get Solutions.', 'Make a Difference.'],
    loop: {},
    typeSpeed: 120,
    deleteSpeed: 80,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []);

  const handleSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

    fetch(`${API_URL}/api/issues/?lat=${latitude}&lon=${longitude}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch nearby issues.");
        return res.json();
      })
      .then((data) => {
        setNearbyIssues(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Could not load issues for your area.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleError = (error) => {
    console.error("Geolocation error:", error);
    setError("Please enable location services to see nearby issues.");
    setLoading(false);
  };

  return (
    <div>
      {/* 🌆 Hero Section with Moving Text */}
      <div
        className="hero-section bg-dark text-white text-center d-flex flex-column justify-content-center align-items-center"
      >
        <div className="hero-overlay"></div>
        <Container style={{ position: "relative", zIndex: 2 }}>
          <h1 className="display-4 fw-bold">
            Your City, Your Voice.
            <br />
            <span>{headlineText}</span>
            <Cursor />
          </h1>
          <p className="lead mt-3">
            Spot a problem? Report potholes, waste, and more directly to your local authorities.
          </p>
          <div className="mt-4">
            <Button as={Link} to="/dashboard" variant="warning" size="lg" className="me-3 pulse-button">
              🚀 Report a Problem
            </Button>
            <Button as={Link} to="/dashboard" variant="outline-light" size="lg">
              📋 View Reports
            </Button>
          </div>
        </Container>
      </div>

      {/* ✨ Nearby Issues Section ✨ */}
      <Container className="py-5">
        <h2 className="text-center fw-bold mb-5">📍 Issues Near You</h2>
        {/* Same logic as before: loading, error, no issues, or issue cards */}
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-2">Fetching your location and nearby issues...</p>
          </div>
        ) : error ? (
          <Alert variant="warning">{error}</Alert>
        ) : nearbyIssues.length === 0 ? (
          <Alert variant="info">No civic issues reported in your area. Be the first!</Alert>
        ) : (
          <Row>
            {nearbyIssues.slice(0, 3).map((issue) => (
              <Col md={4} key={issue.id} className="mb-4">
                <Card className="h-100 shadow-sm issue-card">
                  {issue.photo && (
                    <Card.Img
                      variant="top"
                      src={`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}${issue.photo}`}
                      className="issue-card-img"
                    />
                  )}
                  <Card.Body>
                    <Card.Title className="fw-bold">{issue.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted small">
                      Status: {issue.status}
                    </Card.Subtitle>
                    <Card.Text>
                      {issue.description.substring(0, 100)}...
                    </Card.Text>
                    <Button as={Link} to="/dashboard" variant="primary" size="sm">
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      
      {/* 📞 NEW: Contact Authorities Section */}
      <div className="bg-light">
        <Container className="py-5 text-center">
          <h2 className="fw-bold mb-4">Need Urgent Assistance?</h2>
          <p className="lead mb-4">
            For emergencies or to contact your local municipal office directly, use the links below.
          </p>
          <Row>
            <Col md={4} className="mb-3">
              <Card as="a" href="https://portal.uk.gov.in/" target="_blank" className="text-decoration-none contact-card">
                <Card.Body>
                  <FaPaperPlane size={30} className="mb-2" />
                  <h5 className="fw-bold">Official Portal</h5>
                  <p className="text-muted">Visit the Uttarakhand government portal.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card as="a" href="tel:112" className="text-decoration-none contact-card">
                <Card.Body>
                  <FaPhone size={30} className="mb-2" />
                  <h5 className="fw-bold">Emergency Helpline</h5>
                  <p className="text-muted">Dial the national emergency number.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card as="a" href="mailto:support@example.com" className="text-decoration-none contact-card">
                <Card.Body>
                  <FaEnvelope size={30} className="mb-2" />
                  <h5 className="fw-bold">Email Support</h5>
                  <p className="text-muted">Send an email for non-urgent queries.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}