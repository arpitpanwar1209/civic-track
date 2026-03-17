// src/components/HomeHeader.jsx

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { FaBars, FaTimes } from "react-icons/fa";

export default function HomeHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu on outside click
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
    <header className="home-header py-3">
      <Container className="d-flex justify-content-between align-items-center position-relative">
        
        {/* BRANDING */}
        <Link 
          to="/" 
          className="home-brand fw-bolder tracking-tight d-flex align-items-center"
          style={{ letterSpacing: "-0.5px", fontSize: "1.5rem" }}
        >
          CIVICTRACK
          <span 
            className="bg-primary rounded-circle ms-1 mt-1 shadow-sm" 
            style={{ width: "6px", height: "6px" }} 
          />
        </Link>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="home-menu-btn border-0 p-2 d-flex align-items-center justify-content-center transition-hover"
          aria-label="Toggle Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{ fontSize: "1.25rem" }}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>

        {/* DROPDOWN MENU */}
        {open && (
          <div 
            className="home-menu shadow-lg border-0" 
            ref={menuRef}
            style={{
              position: "absolute",
              top: "100%",
              right: "0.75rem",
              marginTop: "0.5rem",
              background: "rgba(33, 37, 41, 0.95)", // High contrast dark
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: "12px",
              padding: "8px",
              minWidth: "200px",
              zIndex: 1000
            }}
          >
            <div className="d-flex flex-column gap-1">
              <button 
                className="w-100 border-0 bg-transparent text-white text-start px-3 py-2 rounded-2 fw-medium transition-hover"
                style={{ fontSize: "0.95rem" }}
                onClick={() => { navigate("/login"); setOpen(false); }}
              >
                Log In
              </button>
              <button 
                className="w-100 border-0 bg-transparent text-white text-start px-3 py-2 rounded-2 fw-medium transition-hover"
                style={{ fontSize: "0.95rem" }}
                onClick={() => { navigate("/signup"); setOpen(false); }}
              >
                Create Account
              </button>
              
              <hr className="my-1 border-secondary opacity-25" />
              
              <button 
                className="w-100 border-0 bg-transparent text-white text-start px-3 py-2 rounded-2 fw-medium transition-hover"
                style={{ fontSize: "0.95rem" }}
                onClick={() => { navigate("/issues"); setOpen(false); }}
              >
                Explore Database
              </button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}