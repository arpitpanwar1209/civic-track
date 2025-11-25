import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import {
  FaThumbsUp,
  FaEdit,
  FaTrash,
  FaTools,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function IssueCard({
  issue,
  API_URL,
  role,
  onLike,
  onDelete,
  onClaim,
  onResolve
}) {
  // Priority badge UI mapping
  const badgeByPriority = {
    low: "secondary",
    medium: "info",
    high: "warning",
    urgent: "danger",
  };
  const badge = badgeByPriority[issue.priority?.toLowerCase()] || "secondary";

  const photoUrl = issue.photo ? `${API_URL}${issue.photo}` : null;

  return (
    <Card className="h-100 shadow-sm hover-lift">
      {/* Main issue photo */}
      {photoUrl && (
        <Card.Img
          variant="top"
          src={photoUrl}
          alt="Issue"
          style={{ height: 200, objectFit: "cover" }}
        />
      )}

      <Card.Body className="d-flex flex-column">
        {/* Title & Priority */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0 text-truncate" title={issue.title}>
            {issue.title}
          </Card.Title>
          <Badge bg={badge} className="text-uppercase">
            {issue.priority}
          </Badge>
        </div>

        {/* Status */}
        <Card.Subtitle className="mb-2 text-muted small">
          <strong>Status:</strong> {issue.status}
        </Card.Subtitle>

        {/* Description + Reporter */}
        <Card.Text className="small flex-grow-1">
          <div className="text-truncate-2">{issue.description}</div>

          <div className="mt-2 text-muted small">
            <strong>By:</strong> {issue.reporter_name || "Anonymous"} •{" "}
            {new Date(issue.created_at).toLocaleString()}
          </div>

          {/* Location */}
          {issue.location && (
            <div className="text-muted small">
              <strong>Location:</strong> {issue.location}
            </div>
          )}

          {/* Distance */}
          {issue.distance_km && (
            <div className="text-muted small">
              <strong>Distance:</strong> {issue.distance_km} km
            </div>
          )}

          {/* ML Prediction */}
          {issue.predicted_category && (
            <div className="text-muted small">
              <strong>Category (AI):</strong> {issue.predicted_category}
            </div>
          )}
        </Card.Text>

        {/* Button actions */}
        <div className="d-flex flex-wrap gap-2 mt-2">
          {/* ❤️ Consumer: Like */}
          {role === "consumer" && (
            <Button size="sm" variant="success" onClick={() => onLike(issue.id)}>
              <FaThumbsUp className="me-1" /> {issue.likes_count}
            </Button>
          )}

          {/* ✏️ Consumer: Edit */}
          {role === "consumer" && (
            <Button
              size="sm"
              variant="warning"
              href={`/issues/${issue.id}/edit`}
            >
              <FaEdit className="me-1" /> Edit
            </Button>
          )}

          {/* 🗑 Consumer: Delete */}
          {role === "consumer" && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(issue.id)}
            >
              <FaTrash className="me-1" /> Delete
            </Button>
          )}

          {/* 🔧 Provider: Claim */}
          {role === "provider" && !issue.assigned_to && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onClaim(issue.id)}
            >
              <FaTools className="me-1" /> Claim
            </Button>
          )}

          {/* ✔ Provider: Resolve (only if claimed by the same provider) */}
          {role === "provider" &&
            issue.assigned_to_name === localStorage.getItem("username") &&
            issue.status === "in_progress" && (
              <Button
                size="sm"
                variant="success"
                onClick={() => onResolve(issue.id)}
              >
                <FaCheck className="me-1" /> Resolve
              </Button>
            )}

          {/* ⚠ Already claimed by someone else */}
          {role === "provider" &&
            issue.assigned_to &&
            issue.assigned_to_name !== localStorage.getItem("username") && (
              <Badge bg="secondary">
                Claimed by {issue.assigned_to_name}
              </Badge>
            )}
        </div>
      </Card.Body>
    </Card>
  );
}
