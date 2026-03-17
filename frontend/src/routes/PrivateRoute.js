// src/routes/PrivateRoute.jsx

import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";

import { AuthContext } from "../auth/AuthContext";

export default function PrivateRoute({ children }) {

  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // ==============================
  // Auth loading state
  // ==============================

  if (loading) {

    return (

      <Container
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
        aria-busy="true"
        aria-live="polite"
      >

        <Spinner animation="border" role="status" />

        <p className="mt-3 text-muted">
          Checking authentication…
        </p>

      </Container>

    );

  }

  // ==============================
  // Not authenticated
  // ==============================

  if (!user) {

    return (

      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />

    );

  }

  // ==============================
  // Authenticated
  // ==============================

  return children;

}