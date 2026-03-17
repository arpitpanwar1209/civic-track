// src/components/FabReport.jsx

import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

import { AuthContext } from "../auth/AuthContext";

export default function FabReport({
  roleCheck = true,        // Show only for consumers by default
  position = "bottom-right", // bottom-right | bottom-left
  size = 24,               // icon size slightly increased for better click target
  tooltip = "File a Report",
}) {
  const { user } = useContext(AuthContext);

  // Safely check the role from the active session context
  const role = user?.role;

  // Block rendering for providers/admins or unauthenticated users if roleCheck is true
  if (roleCheck && role !== "consumer") return null;

  // Compute inline positioning based on the prop
  const positionStyles = position === "bottom-left" 
    ? { left: "30px" } 
    : { right: "30px" };

  return (
    <Button
      as={Link}
      to="/submit-issue"
      variant="dark"
      className="position-fixed rounded-circle shadow-lg d-flex align-items-center justify-content-center transition-hover"
      title={tooltip}
      style={{
        width: "65px",
        height: "65px",
        bottom: "30px",
        zIndex: 1050, // Ensures it stays above cards and footers
        ...positionStyles
      }}
    >
      <FaPlus size={size} color="white" />
    </Button>
  );
}