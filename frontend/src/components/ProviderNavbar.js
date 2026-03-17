// src/components/ProviderNavbar.jsx
import { Link, useLocation } from "react-router-dom";
import { Nav, Container, Navbar } from "react-bootstrap";
import { FaLayout, FaUserCircle, FaHistory } from "react-icons/fa";

export default function ProviderNavbar() {
  const location = useLocation();

  // Helper to determine active state styling
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="white" className="border-bottom py-2 shadow-sm mb-4">
      <Container>
        <Nav className="w-100 d-flex align-items-center gap-2">
          
          {/* Dashboard Link */}
          <Nav.Link
            as={Link}
            to="/provider/dashboard"
            className={`rounded-pill px-4 py-2 fw-medium transition-hover d-flex align-items-center ${
              isActive("/provider/dashboard") 
                ? "bg-dark text-white shadow-sm" 
                : "text-muted hover-bg-light"
            }`}
          >
            <FaLayout className="me-2" />
            Workspace
          </Nav.Link>

          {/* Profile Link */}
          <Nav.Link
            as={Link}
            to="/profile"
            className={`rounded-pill px-4 py-2 fw-medium transition-hover d-flex align-items-center ${
              isActive("/profile") 
                ? "bg-dark text-white shadow-sm" 
                : "text-muted hover-bg-light"
            }`}
          >
            <FaUserCircle className="me-2" />
            My Profile
          </Nav.Link>

          {/* Optional: Placeholder for additional provider-only links */}
          <Nav.Link
            as={Link}
            to="/issues"
            className={`rounded-pill px-4 py-2 fw-medium transition-hover d-flex align-items-center ms-md-auto ${
              isActive("/issues") 
                ? "bg-dark text-white shadow-sm" 
                : "text-muted hover-bg-light"
            }`}
          >
            <FaHistory className="me-2" />
            Service History
          </Nav.Link>

        </Nav>
      </Container>

      {/* Internal CSS for the hover effect if not already in your global CSS */}
      <style>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
          color: #212529 !important;
        }
        .transition-hover {
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </Navbar>
  );
}