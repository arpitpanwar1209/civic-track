// src/pages/Home.jsx

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import { Container, Row, Col, Button, Badge } from "react-bootstrap";
import { motion } from "framer-motion";

import HomeHeader from "../components/HomeHeader";
import { AuthContext } from "../auth/AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const fade = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  // ================= WHY CIVICTRACK DATA =================
  const cardData = [
    {
      id: 1,
      num: "01",
      title: "Local Issues",
      desc: "Report problems in your area and track their resolution with precise location data.",
    },
    {
      id: 2,
      num: "02",
      title: "Faster Resolution",
      desc: "Authorities receive clear, actionable reports instantly to dispatch service teams.",
    },
    {
      id: 3,
      num: "03",
      title: "Community Driven",
      desc: "Citizens and certified service providers collaborate transparently on a unified platform.",
    },
  ];

  const marqueeCards = [...cardData, ...cardData];

  // ================= REPORTABLE ISSUES DATA =================
  const reportCardsData = [
    {
      id: 101,
      title: "Potholes",
      image:
        "https://images.pexels.com/photos/3068991/pexels-photo-3068991.jpeg",
      desc: "Hazardous road conditions",
      details:
        "Deep potholes damage vehicles and cause accidents. Help improve road safety.",
    },
    {
      id: 102,
      title: "Streetlights",
      image:
        "https://images.unsplash.com/photo-1549419130-9742d453b6f0",
      desc: "Fix dark streets",
      details:
        "Broken street lights create unsafe environments for residents.",
    },
    {
      id: 103,
      title: "Garbage",
      image:
        "https://images.pexels.com/photos/919077/pexels-photo-919077.jpeg",
      desc: "Waste management problems",
      details:
        "Illegal dumping and missed pickups damage the environment.",
    },
    {
      id: 104,
      title: "Water Leaks",
      image:
        "https://images.pexels.com/photos/919078/pexels-photo-919078.jpeg",
      desc: "Pipe bursts or leaks",
      details:
        "Leaking pipelines waste water and can damage infrastructure.",
    },
    {
      id: 105,
      title: "Graffiti",
      image:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
      desc: "Unauthorized graffiti",
      details:
        "Report vandalism to maintain clean public spaces.",
    },
    {
      id: 106,
      title: "Overgrown Grass",
      image:
        "https://images.pexels.com/photos/5910741/pexels-photo-5910741.jpeg",
      desc: "Untidy public areas",
      details:
        "Report parks and medians that require maintenance.",
    },
  ];

  const marqueeImageCards = [...reportCardsData, ...reportCardsData];

  // Determine report button destination
  const reportLink = user
    ? user.role === "provider"
      ? "/provider-dashboard"
      : "/submit-issue"
    : "/login";

  return (
    <div className="home-wrapper bg-light min-vh-100">

      {/* ================= HERO ================= */}

      <section className="hero-section bg-dark text-white position-relative pb-5">
        
        <HomeHeader />
        
        <div className="hero-overlay" style={{ opacity: 0.8 }} />

        <Container className="hero-content py-5 my-md-5 text-center position-relative" style={{ zIndex: 2 }}>
          
          <motion.h1
            className="hero-title display-3 fw-bolder tracking-tight mb-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7 }}
          >
            Enhance Your Community
            <br />
            <span className="text-primary">
              One Report at a Time
            </span>
          </motion.h1>

          <motion.p
            className="hero-sub mx-auto text-secondary fs-5 mb-5"
            style={{ maxWidth: '700px' }}
            variants={fade}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            Report infrastructure hazards, sanitation problems, and other civic issues directly to certified providers to maintain a safe, clean neighborhood.
          </motion.p>

          <motion.div
            className="hero-actions d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4"
            variants={fade}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <Button
              as={Link}
              to={reportLink}
              variant="light"
              size="lg"
              className="px-5 py-3 fw-bold rounded-pill shadow-sm"
            >
              Report an Issue
            </Button>

            <Button
              as={Link}
              to="/issues"
              variant="outline-light"
              size="lg"
              className="px-5 py-3 fw-bold rounded-pill"
            >
              Explore Dashboard
            </Button>
          </motion.div>

        </Container>
      </section>

      {/* ================= WHY CIVICTRACK ================= */}

      <section className="issues-section py-5 my-4">
        <Container fluid className="px-md-5">
          <div className="text-center mb-5">
            <h3 className="section-title h2 fw-bolder text-dark mb-2">
              Why CivicTrack?
            </h3>
            <p className="text-muted">A modern approach to civic maintenance.</p>
          </div>

          <div className="marquee-container">
            <div className="marquee-track">
              {marqueeCards.map((card, index) => (
                <div className="flip-card" key={`${card.id}-${index}`}>
                  <div className="flip-card-inner">
                    
                    <div className="flip-card-front bg-white border-0 shadow-sm rounded-4 d-flex flex-column justify-content-center align-items-center p-4">
                      <h2 className="display-4 fw-bolder text-light mb-3">{card.num}</h2>
                      <h4 className="card-title fw-bold text-dark mb-0">
                        {card.title}
                      </h4>
                    </div>

                    <div className="flip-card-back bg-dark text-white border-0 shadow-sm rounded-4 d-flex flex-column justify-content-center p-4">
                      <h5 className="fw-bold mb-3 border-bottom border-secondary pb-2">{card.title}</h5>
                      <p className="small text-secondary mb-4">{card.desc}</p>
                      <Badge bg="primary" className="mt-auto align-self-start rounded-pill px-3 py-2">
                        System Advantage
                      </Badge>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ================= REPORTABLE ISSUES ================= */}

      <section className="issues-section image-issues-section py-5 bg-white border-top">
        <Container fluid className="px-md-5">
          <div className="text-center mb-5">
            <h3 className="section-title h2 fw-bolder text-dark mb-2">
              Supported Categories
            </h3>
            <p className="text-muted">What you can report on our platform.</p>
          </div>

          <div className="marquee-container">
            <div className="marquee-track image-marquee-track">
              {marqueeImageCards.map((card, index) => (
                <div
                  className="flip-card image-flip-card shadow-sm rounded-4 overflow-hidden"
                  key={`${card.id}-${index}`}
                >
                  <div className="flip-card-inner">
                    
                    <div
                      className="flip-card-front"
                      style={{
                        backgroundImage: `url(${card.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="card-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))' }} />
                      <h4 className="card-title fw-bold text-white mb-0 position-relative" style={{ zIndex: 2 }}>
                        {card.title}
                      </h4>
                    </div>

                    <div className="flip-card-back bg-dark text-white p-4 d-flex flex-column">
                      <h5 className="fw-bold border-bottom border-secondary pb-2 mb-3">{card.title}</h5>
                      <p className="card-desc fw-semibold text-primary small text-uppercase tracking-tight mb-2">{card.desc}</p>
                      <p className="card-details small text-secondary">
                        {card.details}
                      </p>
                      <Badge bg="light" text="dark" className="mt-auto align-self-start rounded-pill px-3 py-2 fw-medium">
                        Public Domain
                      </Badge>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="footer-section bg-dark text-white pt-5 pb-4">
        <Container>
          <Row className="g-4 mb-4 border-bottom border-secondary pb-5">
            
            <Col md={4} className="footer-col">
              <h5 className="fw-bold mb-4 tracking-tight">Navigation</h5>
              <div className="d-flex flex-column gap-2">
                <Link to="/" className="text-secondary text-decoration-none transition-hover">Home</Link>
                <Link to="/issues" className="text-secondary text-decoration-none transition-hover">Explore Database</Link>
                <Link to="/submit-issue" className="text-secondary text-decoration-none transition-hover">File a Report</Link>
              </div>
            </Col>

            <Col md={4} className="footer-col">
              <h5 className="fw-bold mb-4 tracking-tight">Platform</h5>
              <div className="d-flex flex-column gap-2">
                <Link to="/about" className="text-secondary text-decoration-none transition-hover">About CivicTrack</Link>
                <Link to="/dashboard" className="text-secondary text-decoration-none transition-hover">Consumer Portal</Link>
                <Link to="/provider-dashboard" className="text-secondary text-decoration-none transition-hover">Provider Portal</Link>
              </div>
            </Col>

            <Col md={4} className="footer-col">
              <h5 className="fw-bold mb-4 tracking-tight">Legal & Support</h5>
              <div className="d-flex flex-column gap-2">
                <Link to="/legal/privacy" className="text-secondary text-decoration-none transition-hover">Privacy Policy</Link>
                <Link to="/legal/terms" className="text-secondary text-decoration-none transition-hover">Terms of Service</Link>
              </div>
            </Col>

          </Row>

          <div className="footer-bottom text-center">
            <p className="small text-secondary mb-0 fw-medium tracking-wide">
              © {new Date().getFullYear()} CIVICTRACK PLATFORM. ALL RIGHTS RESERVED.
            </p>
          </div>
        </Container>
      </footer>

    </div>
  );
}