// frontend/src/pages/Home.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { FaPaperPlane, FaPhone, FaEnvelope } from "react-icons/fa";
import "./home.css";
import BackButton from "../components/BackButton";

export default function Home() {
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access");
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  const [headlineText] = useTypewriter({
    words: ["Report Civic Issues.", "Get Solutions.", "Make a Difference."],
    loop: {},
    typeSpeed: 120,
    deleteSpeed: 80,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []);

  const handleSuccess = ({ coords }) => {
    const { latitude, longitude } = coords;

    fetch(`${API_URL}/api/issues/?nearby=${latitude},${longitude}&radius_km=5`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setNearbyIssues(Array.isArray(data) ? data : data.results || []))
      .catch(() => setError("Could not load nearby issues."))
      .finally(() => setLoading(false));
  };

  const handleError = () => {
    setError("Please enable location access to see nearby issues.");
    setLoading(false);
  };

  return (
    <div>
      {/* 🌆 HERO SECTION */}
      <div className="hero-section bg-dark text-white text-center d-flex flex-column justify-content-center align-items-center">
        <div className="hero-overlay"></div>

        <Container style={{ position: "relative", zIndex: 2 }}>
          <h1 className="display-4 fw-bold">
            Your City, Your Voice.
            <br />
            <span>{headlineText}</span>
            <Cursor />
          </h1>

          <p className="lead mt-3">
            Spot a problem? Report potholes, water leaks, garbage issues & more.
          </p>

          <div className="mt-4">

            {role === "consumer" && (
              <>
                <Button as={Link} to="/dashboard" variant="warning" size="lg" className="me-3 pulse-button">
                  🚀 Report an Issue
                </Button>

                <Button as={Link} to="/dashboard" variant="outline-light" size="lg">
                  📋 View My Reports
                </Button>
              </>
            )}

            {role === "provider" && (
              <Button as={Link} to="/dashboard" variant="info" size="lg" className="pulse-button">
                🛠️ View Issues to Resolve
              </Button>
            )}

            {!role && (
              <Button as={Link} to="/login" variant="warning" size="lg" className="pulse-button">
                🔐 Login to Get Started
              </Button>
            )}
          </div>
        </Container>
      </div>

      {/* Back Navigation */}
      <Container className="mt-3">
        <BackButton />
      </Container>

      {/* 📍 NEARBY ISSUES */}
      <Container className="py-5">
        <h2 className="text-center fw-bold mb-5">📍 Issues Near You</h2>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Fetching location...</p>
          </div>
        ) : error ? (
          <Alert variant="warning">{error}</Alert>
        ) : nearbyIssues.length === 0 ? (
          <Alert variant="info">No issues reported nearby yet.</Alert>
        ) : (
          <Row>
            {nearbyIssues.slice(0, 3).map((issue) => (
              <Col md={4} key={issue.id} className="mb-4">
                <Card className="h-100 shadow-sm issue-card">
                  {issue.photo && (
                    <Card.Img
                      variant="top"
                      src={`${API_URL}${issue.photo}`}
                      className="issue-card-img"
                    />
                  )}
                  <Card.Body>
                    <Card.Title className="fw-bold">{issue.title}</Card.Title>
                    <Card.Subtitle className="text-muted small mb-2">
                      Status: {issue.status}
                    </Card.Subtitle>
                    <Card.Text className="small">
                      {issue.description?.substring(0, 100)}...
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

      {/* 📞 CONTACT SECTION */}
      <div className="bg-light">
        <Container className="py-5 text-center">
          <h2 className="fw-bold mb-4">Need Urgent Help?</h2>
          <p className="lead mb-4">Use these resources for emergency or municipal support.</p>
          <Row>
            <Col md={4}>
              <Card className="contact-card p-3">
                <FaPaperPlane size={30} className="mb-2" />
                <h5 className="fw-bold">Municipal Portal</h5>
                <p>Visit your local municipal services website.</p>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="contact-card p-3">
                <FaPhone size={30} className="mb-2" />
                <h5 className="fw-bold">Emergency Helpline</h5>
                <p>Call 112 for urgent help.</p>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="contact-card p-3">
                <FaEnvelope size={30} className="mb-2" />
                <h5 className="fw-bold">Email Support</h5>
                <p>support@civictrack.org</p>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
