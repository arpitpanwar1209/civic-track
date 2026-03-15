import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import { motion } from "framer-motion";

import HomeHeader from "../components/HomeHeader";
import { AuthContext } from "../auth/AuthContext";

export default function Home() {

  const { user } = useContext(AuthContext);

  // ================= WHY CIVICTRACK DATA =================
  const cardData = [
    {
      id: 1,
      title: "Local Issues",
      desc: "Report problems in your area and track their resolution.",
      icon: "📍",
    },
    {
      id: 2,
      title: "Faster Resolution",
      desc: "Authorities receive clear, actionable reports instantly.",
      icon: "⚡",
    },
    {
      id: 3,
      title: "Community Driven",
      desc: "Citizens and service providers collaborate transparently.",
      icon: "🤝",
    },
  ];

  const marqueeCards = [...cardData, ...cardData];

  // ================= REPORTABLE ISSUES DATA =================
  const reportCardsData = [
    {
      id: 101,
      title: "Potholes",
      image:
        "https://images.pexels.com/photos/3068991/pexels-photo-3068991.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Hazardous road conditions",
      details:
        "Deep potholes damage vehicles and cause accidents. Help improve road safety.",
    },
    {
      id: 102,
      title: "Streetlights",
      image:
        "https://images.unsplash.com/photo-1549419130-9742d453b6f0?q=80&w=800&auto=format&fit=crop",
      desc: "Fix dark streets",
      details:
        "Broken street lights create unsafe environments for residents.",
    },
    {
      id: 103,
      title: "Garbage",
      image:
        "https://images.pexels.com/photos/919077/pexels-photo-919077.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Waste management problems",
      details:
        "Illegal dumping and missed pickups damage the environment.",
    },
    {
      id: 104,
      title: "Water Leaks",
      image:
        "https://images.pexels.com/photos/919078/pexels-photo-919078.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Pipe bursts or leaks",
      details:
        "Leaking pipelines waste water and can damage infrastructure.",
    },
    {
      id: 105,
      title: "Graffiti",
      image:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop",
      desc: "Unauthorized graffiti",
      details:
        "Report vandalism to maintain clean public spaces.",
    },
    {
      id: 106,
      title: "Overgrown Grass",
      image:
        "https://images.pexels.com/photos/5910741/pexels-photo-5910741.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Untidy public areas",
      details:
        "Report parks and medians that require maintenance.",
    },
  ];

  const marqueeImageCards = [...reportCardsData, ...reportCardsData];

  return (
    <div className="home-wrapper">

      {/* ================= HERO SECTION ================= */}

      <section className="hero-section">

        <HomeHeader />

        <div className="hero-overlay" />

        <Container className="hero-content">

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            MAKE YOUR COMMUNITY BETTER
            <br />
            <span className="text-gradient">
              ONE REPORT AT A TIME
            </span>
          </motion.h1>

          <motion.p
            className="hero-sub mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Report potholes, broken streetlights, garbage problems
            and other civic issues to help your neighborhood stay
            safe and clean.
          </motion.p>

          <motion.div
            className="hero-actions mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >

            <Button
              as={Link}
              to={user ? "/submit-issue" : "/login"}
              size="lg"
              className="cta-btn primary me-3"
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

          </motion.div>

        </Container>

      </section>

      {/* ================= WHY CIVICTRACK ================= */}

      <section className="issues-section">

        <Container fluid className="px-0">

          <h3 className="section-title text-center mb-5">
            Why CivicTrack?
          </h3>

          <div className="marquee-container">

            <div className="marquee-track">

              {marqueeCards.map((card, index) => (

                <div className="flip-card" key={`${card.id}-${index}`}>

                  <div className="flip-card-inner">

                    <div className="flip-card-front">

                      <div className="card-icon">{card.icon}</div>

                      <h4 className="card-title text-gradient">
                        {card.title}
                      </h4>

                    </div>

                    <div className="flip-card-back">

                      <h5>{card.title}</h5>

                      <p>{card.desc}</p>

                      <span className="fast-resolution-badge">
                        Faster Resolution
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </Container>

      </section>

      {/* ================= REPORTABLE ISSUES ================= */}

      <section className="issues-section image-issues-section">

        <Container fluid className="px-0">

          <h3 className="section-title text-center mb-5">
            Reportable Issues
          </h3>

          <div className="marquee-container">

            <div className="marquee-track image-marquee-track">

              {marqueeImageCards.map((card, index) => (

                <div
                  className="flip-card image-flip-card"
                  key={`${card.id}-${index}`}
                >

                  <div className="flip-card-inner">

                    <div
                      className="flip-card-front"
                      style={{
                        backgroundImage: `url(${card.image})`,
                      }}
                    >

                      <div className="card-overlay" />

                      <h4 className="card-title text-gradient-bold">
                        {card.title}
                      </h4>

                    </div>

                    <div className="flip-card-back">

                      <h5>{card.title}</h5>

                      <p className="card-desc">{card.desc}</p>

                      <p className="card-details">
                        {card.details}
                      </p>

                      <span className="fast-resolution-badge">
                        Community Driven
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </Container>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="footer-section">

        <Container>

          <Row className="g-4">

            <Col md={4} className="footer-col">
              <h5>Navigation</h5>
              <Link to="/">Home</Link>
              <Link to="/issues">Explore Issues</Link>
              <Link to="/submit-issue">Report Issue</Link>
            </Col>

            <Col md={4} className="footer-col">
              <h5>Resources</h5>
              <Link to="/resources/authorities">
                Local Authorities
              </Link>
              <Link to="/resources/safety">
                Safety Tips
              </Link>
              <Link to="/resources/guidelines">
                Community Guidelines
              </Link>
            </Col>

            <Col md={4} className="footer-col">
              <h5>Legal</h5>
              <Link to="/legal/privacy">Privacy Policy</Link>
              <Link to="/legal/terms">Terms & Conditions</Link>
              <Link to="/about">About Us</Link>
            </Col>

          </Row>

          <div className="footer-bottom text-center mt-5">

            <p className="small text-muted">
              © 2025 CivicTrack. All rights reserved.
            </p>

          </div>

        </Container>

      </footer>

    </div>
  );
}