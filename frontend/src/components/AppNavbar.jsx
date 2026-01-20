import { useContext, useEffect, useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Button,
  Dropdown,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaMapMarkedAlt, FaPlusCircle } from "react-icons/fa";

import { AuthContext } from "../auth/AuthContext";

export default function AppNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const isLoggedIn = !!user;
  const role = user?.role;
  const username = user?.username || "User";

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Role-aware dashboard path
  const dashboardPath =
    role === "provider"
      ? "/provider/dashboard"
      : "/consumer/dashboard";

  const avatarSeed = encodeURIComponent(username);
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${avatarSeed}`;

  const handleLogout = () => {
    logout(); // AuthContext handles cleanup + redirect
    navigate("/login", { replace: true });
  };

  return (
    <Navbar
      expand="lg"
      bg="white"
      className={`shadow-sm sticky-top transition-nav ${
        scrolled ? "nav-scrolled" : ""
      }`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          CivicTrack <span className="brand-dot" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {isLoggedIn && (
              <Nav.Link as={Link} to={dashboardPath}>
                <FaMapMarkedAlt className="me-1" /> Dashboard
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/issues">Issues</Nav.Link>
          </Nav>

          {!isLoggedIn ? (
            <div className="d-flex gap-2">
              <Button as={Link} to="/login" variant="outline-primary">
                Login
              </Button>
              <Button as={Link} to="/signup" variant="primary">
                Sign Up
              </Button>
            </div>
          ) : (
            <div className="d-flex gap-2 align-items-center">
              {role === "consumer" && (
                <Button
                  as={Link}
                  to="/consumer/dashboard#report"
                  variant="success"
                >
                  <FaPlusCircle className="me-1" /> Report
                </Button>
              )}

              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="d-flex align-items-center"
                >
                  <Image
                    roundedCircle
                    width={28}
                    height={28}
                    alt="avatar"
                    src={avatarUrl}
                    className="me-2"
                  />
                  <span className="small">
                    {username}{" "}
                    <span className="text-muted">
                      ({role})
                    </span>
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={handleLogout}
                    className="text-danger"
                  >
                    Logout
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
