// frontend/src/components/IssueCard.jsx

import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import {
  FaThumbsUp,
  FaEdit,
  FaTrash,
  FaTools,
  FaCheck,
  FaPlay,
  FaMapMarkerAlt,
} from "react-icons/fa";

import Status from "./Status";

export default function IssueCard({
  issue,
  API_URL,
  role,
  currentUser,
  onLike,
  onDelete,
  onClaim,
  onStart,
  onResolve,
}) {
  // Enterprise High-Contrast Priority Mapping
  const getPriorityVariant = (priority) => {
    const p = priority?.toLowerCase() || "";
    if (p === "high" || p === "urgent") return "danger";
    if (p === "medium") return "warning text-dark";
    return "secondary";
  };

  const imageUrl = issue.image
    ? issue.image.startsWith("http")
      ? issue.image
      : `${API_URL}${issue.image}`
    : null;

  return (
    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-hover">
      {/* Image Section */}
      <div className="position-relative">
        {imageUrl ? (
          <Card.Img
            variant="top"
            src={imageUrl}
            alt="Issue Evidence"
            style={{ height: 180, objectFit: "cover" }}
          />
        ) : (
          <div 
            className="bg-light d-flex align-items-center justify-content-center text-muted" 
            style={{ height: 180 }}
          >
            <span className="small fw-medium text-uppercase tracking-widest">No Image Provided</span>
          </div>
        )}
        {/* Absolute Floating Priority Badge */}
        <Badge 
          bg={getPriorityVariant(issue.priority)} 
          className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm text-uppercase"
          style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
        >
          {issue.priority}
        </Badge>
      </div>

      <Card.Body className="p-4 d-flex flex-column">
        {/* Category & Date */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-primary fw-bold small text-uppercase tracking-wide">
            {issue.category || "General"}
          </span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
            {new Date(issue.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Title */}
        <Card.Title className="fw-bolder text-dark mb-2 text-truncate" title={issue.title}>
          {issue.title}
        </Card.Title>

        {/* Status Component Wrapper */}
        <div className="mb-3">
          <Status status={issue.status} />
        </div>

        {/* Metadata Details */}
        <div className="flex-grow-1">
          <p className="text-muted small mb-3 lh-base" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {issue.description}
          </p>

          <div className="d-flex flex-column gap-1 border-top pt-3">
            <div className="d-flex align-items-center text-dark small fw-medium">
              <FaMapMarkerAlt className="text-muted me-2" />
              <span className="text-truncate">{issue.location || "Location not specified"}</span>
            </div>

            {issue.distance !== undefined && (
              <div className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '1.5rem' }}>
                {issue.distance.toFixed(2)} km away
              </div>
            )}

            <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
              <span className="fw-semibold text-dark">Reporter:</span> {issue.reporter_name || "Anonymous"}
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="d-flex flex-wrap gap-2 mt-4 pt-2 border-top">
          {/* Consumer Controls */}
          {role === "consumer" && (
            <>
              <Button
                variant="outline-success"
                size="sm"
                className="rounded-pill px-3 fw-bold"
                onClick={() => onLike(issue.id)}
              >
                <FaThumbsUp className="me-1 mb-1" />
                {issue.likes_count}
              </Button>

              <Button
                variant="outline-dark"
                size="sm"
                className="rounded-pill px-3 fw-medium ms-auto"
                href={`/issues/${issue.id}/edit`}
              >
                <FaEdit className="me-1 mb-1" />
                Edit
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="rounded-pill px-3 fw-medium"
                onClick={() => onDelete(issue.id)}
              >
                <FaTrash className="mb-1" />
              </Button>
            </>
          )}

          {/* Provider Logic: Claim */}
          {role === "provider" && issue.status === "pending" && (
            <Button
              variant="dark"
              size="sm"
              className="w-100 rounded-pill py-2 fw-bold shadow-sm"
              onClick={() => onClaim(issue.id)}
            >
              <FaTools className="me-2" />
              Claim Task
            </Button>
          )}

          {/* Provider Logic: Start */}
          {role === "provider" &&
            issue.status === "assigned" &&
            issue.assigned_to_name === currentUser && (
              <Button
                variant="warning"
                size="sm"
                className="w-100 rounded-pill py-2 fw-bold shadow-sm"
                onClick={() => onStart(issue.id)}
              >
                <FaPlay className="me-2" />
                Begin Work
              </Button>
            )}

          {/* Provider Logic: Resolve */}
          {role === "provider" &&
            issue.status === "in_progress" &&
            issue.assigned_to_name === currentUser && (
              <Button
                variant="success"
                size="sm"
                className="w-100 rounded-pill py-2 fw-bold shadow-sm"
                onClick={() => onResolve(issue.id)}
              >
                <FaCheck className="me-2" />
                Mark Resolved
              </Button>
            )}

          {/* Third-Party Claim Info */}
          {role === "provider" &&
            issue.assigned_to_name &&
            issue.assigned_to_name !== currentUser && (
              <div className="w-100 text-center py-2 bg-light rounded-pill border">
                <span className="text-muted small fw-bold">
                  Assigned to {issue.assigned_to_name}
                </span>
              </div>
            )}
        </div>
      </Card.Body>
    </Card>
  );
}