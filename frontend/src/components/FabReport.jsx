import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function FabReport({
  roleCheck = true,        // Show only for consumers by default
  position = "bottom-right", // bottom-right | bottom-left
  size = 20,               // icon size
  tooltip = "Report an issue",
}) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // read role after mount to avoid SSR mismatch/flash
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  if (roleCheck && role !== "consumer") return null; // block for providers/admins

  const positionClass =
    position === "bottom-left"
      ? "fab-left"
      : "fab-right"; // default bottom-right

  return (
    <Button
      as={Link}
      to="/dashboard#report"
      variant="primary"
      className={`fab-report shadow-lg ${positionClass}`}
      title={tooltip}
    >
      <FaPlus size={size} />
    </Button>
  );
}
