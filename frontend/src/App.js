import "./App.css"; // <-- 1. Import your CSS file
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import react-bootstrap components
import { Navbar, Nav, Container } from 'react-bootstrap';

// Import Pages
import Issues from "./pages/issue";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import SubmitIssue from "./pages/submitissue";
import Profile from "./pages/profile";
import EditIssue from "./pages/EditIssue";

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">

        {/* ✅ Improved React-Bootstrap Navbar */}
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
          <Container>
            {/* 2. Added className for styling */}
            <Navbar.Brand as={Link} to="/" className="nav-link-brand">
              CivicTrack
            </Navbar.Brand>
            
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              
              {/* 3. Added className to all links */}
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/dashboard" className="nav-link">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/submit" className="nav-link">Submit Issue</Nav.Link>
                <Nav.Link as={Link} to="/profile" className="nav-link">Profile</Nav.Link>
              </Nav>

              <Nav>
                <Nav.Link as={Link} to="/login" className="nav-link">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup" className="nav-link">Signup</Nav.Link>
              </Nav>

            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* ✅ Routes (single place only) */}
        <main style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitIssue />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/issues/:id/edit" element={<EditIssue />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;