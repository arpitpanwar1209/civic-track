import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { FaBars, FaTimes } from "react-icons/fa";

export default function HomeHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="home-header">
      <Container className="d-flex justify-content-between align-items-center">
        <Link to="/" className="home-brand">
          CivicTrack <span className="brand-dot" />
        </Link>

        <button
          className="home-menu-btn"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </Container>

      {/* DROPDOWN MENU */}
      {open && (
        <div className="home-menu" ref={menuRef}>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/signup")}>Sign Up</button>
          <button onClick={() => navigate("/issues")}>Explore Issues</button>
        </div>
      )}
    </header>
  );
}
