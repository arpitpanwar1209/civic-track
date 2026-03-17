// src/components/BackButton.jsx

import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { AuthContext } from "../auth/AuthContext";

export default function BackButton({
  label = "Back",
  className = "",
  variant = "outline-secondary", // Default to a subtle enterprise gray
  ...props
}) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
      return;
    }

    // Role-aware fallback
    if (user?.role === "provider") {
      navigate("/provider/dashboard", { replace: true });
    } else if (user?.role === "consumer") {
      navigate("/consumer/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <Button
      variant={variant}
      className={`rounded-pill px-3 py-2 fw-medium shadow-sm transition-hover d-inline-flex align-items-center ${className}`}
      onClick={handleBack}
      {...props}
    >
      <FaArrowLeft className="me-2" />
      {label}
    </Button>
  );
}