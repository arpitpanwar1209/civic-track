// src/components/AppNavbar.jsx

import { useContext, useEffect, useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Button,
  Dropdown,
  Image,
  Badge
} from "react-bootstrap";

import { Link } from "react-router-dom";
import { FaMapMarkedAlt, FaPlusCircle, FaUserCircle, FaSignOutAlt } from "react-icons/fa";

import { AuthContext } from "../auth/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useContext(AuthContext);

  const isLoggedIn = !!user;
  const role = user?.role;
  const username = user?.username || "User";

  const [scrolled, setScrolled] = useState(false);

  // ======================================
  // Navbar scroll effect
  // ======================================
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ======================================
  // Role-based dashboard
  // ======================================
  const dashboardPath =
    role === "provider"
      ? "/provider-dashboard"
      : "/dashboard";

  // ======================================
  // Avatar
  // ======================================
  const avatarSeed = encodeURIComponent(username);
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${avatarSeed}&backgroundColor=212529&textColor=ffffff`;

  // ======================================
  // Logout
  // ======================================
  const handleLogout = () => {
    logout(); // AuthContext clears token
  };

  return (
    <Navbar
      expand="lg"
      bg="white"
      className={`sticky-top transition-hover ${
        scrolled ? "shadow-sm border-bottom border-light" : "border-bottom border-light"
      } py-3`}
    >
      <Container>
        {/* ================= BRAND ================= */}
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bolder tracking-tight text-dark fs-4 d-flex align-items-center"
          style={{ letterSpacing: "-0.5px" }}
        >
          CIVICTRACK
          <span className="bg-primary rounded-circle ms-1 mt-1" style={{ width: "6px", height: "6px" }} />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" className="border-0 shadow-none" />

        <Navbar.Collapse id="main-navbar">
          
          {/* ================= LINKS ================= */}
          <Nav className="mx-auto gap-1 gap-lg-3 mt-3 mt-lg-0">
            {isLoggedIn && (
              <Nav.Link 
                as={Link} 
                to={dashboardPath} 
                className="fw-semibold text-dark px-3 rounded-pill transition-hover d-flex align-items-center"
              >
                <FaMapMarkedAlt className="me-2 text-muted" />
                Portal
              </Nav.Link>
            )}

            <Nav.Link 
              as={Link} 
              to="/issues" 
              className="fw-semibold text-dark px-3 rounded-pill transition-hover"
            >
              Explore Database
            </Nav.Link>
          </Nav>

          {/* ================= ACTIONS ================= */}
          {!isLoggedIn ? (
            <div className="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
              <Button
                as={Link}
                to="/login"
                variant="outline-dark"
                className="rounded-pill px-4 fw-medium transition-hover"
              >
                Log In
              </Button>
              <Button
                as={Link}
                to="/signup"
                variant="dark"
                className="rounded-pill px-4 fw-medium shadow-sm transition-hover"
              >
                Create Account
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center mt-3 mt-lg-0">
              
              {role === "consumer" && (
                <Button
                  as={Link}
                  to="/submit-issue"
                  variant="dark"
                  className="rounded-pill px-4 py-2 fw-medium shadow-sm transition-hover d-flex align-items-center justify-content-center"
                >
                  <FaPlusCircle className="me-2" />
                  File Report
                </Button>
              )}

              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="d-flex align-items-center rounded-pill border py-1 px-2 bg-white shadow-sm transition-hover w-100"
                >
                  <Image
                    roundedCircle
                    width={32}
                    height={32}
                    alt="User Avatar"
                    src={avatarUrl}
                    className="me-2 border border-light"
                  />
                  <span className="fw-semibold text-dark me-2 small">
                    {username}
                  </span>
                  <Badge 
                    bg={role === 'provider' ? 'primary' : 'secondary'} 
                    className="text-uppercase tracking-tight rounded-pill me-1" 
                    style={{ fontSize: '0.65rem' }}
                  >
                    {role}
                  </Badge>
                </Dropdown.Toggle>

                <Dropdown.Menu className="border-0 shadow-sm rounded-4 mt-2 p-2">
                  <Dropdown.Item 
                    as={Link} 
                    to="/profile" 
                    className="fw-medium rounded-2 py-2 d-flex align-items-center transition-hover"
                  >
                    <FaUserCircle className="me-2 text-muted" />
                    Manage Profile
                  </Dropdown.Item>

                  <Dropdown.Divider className="my-2" />

                  <Dropdown.Item
                    onClick={handleLogout}
                    className="text-danger fw-medium rounded-2 py-2 d-flex align-items-center transition-hover"
                  >
                    <FaSignOutAlt className="me-2" />
                    Secure Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

            </div>
          )}

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}