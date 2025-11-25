import React, { useEffect, useState } from "react";
import { Navbar, Container, Nav, Button, Dropdown, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaMapMarkedAlt, FaPlusCircle } from "react-icons/fa";

export default function AppNavbar() {
  const navigate = useNavigate();

  // read auth info once at mount — if you move to Context/Redux later replace this
  const [auth, setAuth] = useState({
    username: localStorage.getItem("username") || "",
    role: localStorage.getItem("role") || "",
    isLoggedIn: !!localStorage.getItem("access"),
  });

  useEffect(() => {
    // If some other part of the app may update localStorage, you can listen for
    // 'storage' events (works across tabs). For single-tab, consider pushing updates
    // through context instead.
    const onStorage = (e) => {
      if (e.key === "username" || e.key === "role" || e.key === "access") {
        setAuth({
          username: localStorage.getItem("username") || "",
          role: localStorage.getItem("role") || "",
          isLoggedIn: !!localStorage.getItem("access"),
        });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const { username, role, isLoggedIn } = auth;

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    // update state quickly so UI updates immediately
    setAuth({ username: "", role: "", isLoggedIn: false });

    // navigate to home (or login). If your app redirects unauthenticated users to /login,
    // you can just navigate to '/' and the routing logic will handle it.
    navigate("/", { replace: true });
    navigate("/login");
  };

  const collapseId = "main-navbar";

  // safe avatar url
  const avatarSeed = encodeURIComponent(username || "CivicTrack");
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${avatarSeed}`;

  return (
    <Navbar
      expand="lg"
      bg="white"
      className={`shadow-sm sticky-top transition-nav ${scrolled ? "nav-scrolled" : ""}`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          CivicTrack <span className="brand-dot" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls={collapseId} aria-label="Toggle navigation" />

        <Navbar.Collapse id={collapseId}>
          <Nav className="me-auto">
            {isLoggedIn && (
              <Nav.Link as={Link} to="/dashboard">
                <FaMapMarkedAlt className="me-1" /> Dashboard
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/issues">Issues</Nav.Link>
          </Nav>

          {!isLoggedIn ? (
            <div className="d-flex gap-2">
              <Button as={Link} to="/login" variant="outline-primary">Login</Button>
              <Button as={Link} to="/signup" variant="primary">Sign Up</Button>
            </div>
          ) : (
            <div className="d-flex gap-2 align-items-center">
              {role === "consumer" && (
                <Button as={Link} to="/dashboard#report" variant="success">
                  <FaPlusCircle className="me-1" /> Report
                </Button>
              )}

              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="d-flex align-items-center">
                  <Image
                    roundedCircle
                    width={28}
                    height={28}
                    alt="avatar"
                    src={avatarUrl}
                    className="me-2"
                  />
                  <span className="small">
                    {username || "User"}{" "}
                    <span className="text-muted">({role || "unknown"})</span>
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="text-danger">
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
