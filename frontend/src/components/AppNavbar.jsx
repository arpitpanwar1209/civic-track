import React from "react";
import { Navbar, Container, Nav, Button, Dropdown, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaMapMarkedAlt, FaPlusCircle } from "react-icons/fa";

export default function AppNavbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const isLoggedIn = !!localStorage.getItem("access");

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <Navbar expand="lg" bg="white" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          CivicTrack <span className="brand-dot"></span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard"><FaMapMarkedAlt className="me-1" /> Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/issues">Issues</Nav.Link>
          </Nav>

          {!isLoggedIn ? (
            <div className="d-flex gap-2">
              <Button as={Link} to="/login" variant="outline-primary">Login</Button>
              <Button as={Link} to="/signup" variant="primary">Sign Up</Button>
            </div>
          ) : (
            <div className="d-flex gap-2 align-items-center">
              <Button as={Link} to="/dashboard#report" variant="success">
                <FaPlusCircle className="me-1" /> Report
              </Button>
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="d-flex align-items-center">
                  <Image
                    roundedCircle
                    width={28}
                    height={28}
                    alt="avatar"
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${username || "CT"}`}
                    className="me-2"
                  />
                  <span className="small">{username} <span className="text-muted">({role})</span></span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="text-danger">Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
