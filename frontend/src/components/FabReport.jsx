import React from "react";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function FabReport() {
  return (
    <Button
      as={Link}
      to="/dashboard#report"
      variant="primary"
      className="fab-report shadow-lg"
      title="Report an issue"
    >
      <FaPlus />
    </Button>
  );
}
