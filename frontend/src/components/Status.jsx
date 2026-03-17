// src/components/Status.jsx

import React from "react";
import { Badge } from "react-bootstrap";

export default function Status({ status }) {
  if (!status) return null;

  // Professional enterprise color mapping
  const statusMap = {
    pending: {
      bg: "secondary",
      text: "white",
      label: "Pending Review",
      dot: "#adb5bd"
    },
    assigned: {
      bg: "info",
      text: "dark",
      label: "Task Assigned",
      dot: "#0dcaf0"
    },
    in_progress: {
      bg: "warning",
      text: "dark",
      label: "In Progress",
      dot: "#ffc107"
    },
    resolved: {
      bg: "success",
      text: "white",
      label: "Resolved",
      dot: "#198754"
    },
    closed: {
      bg: "dark",
      text: "white",
      label: "Closed",
      dot: "#212529"
    }
  };

  const config = statusMap[status?.toLowerCase()] || {
    bg: "dark",
    text: "white",
    label: status,
    dot: "#ffffff"
  };

  return (
    <Badge 
      bg={config.bg} 
      text={config.text}
      className="rounded-pill px-3 py-2 d-inline-flex align-items-center border shadow-sm"
      style={{ 
        fontSize: '0.75rem', 
        letterSpacing: '0.5px',
        fontWeight: '700',
        textTransform: 'uppercase'
      }}
    >
      {/* Small status dot indicator */}
      <span 
        className="rounded-circle me-2" 
        style={{ 
          width: '8px', 
          height: '8px', 
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          border: `1px solid ${config.text === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}`
        }} 
      />
      {config.label}
    </Badge>
  );
}