import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { FaThumbsUp, FaEdit, FaTrash } from "react-icons/fa";

export default function IssueCard({ issue, API_URL, onLike, onDelete }) {
  const badgeByPriority = {
    low: "secondary",
    medium: "info",
    high: "warning",
    urgent: "danger",
  };
  const badge = badgeByPriority[(issue.priority || "").toLowerCase()] || "secondary";

  return (
    <Card className="h-100 shadow-sm hover-lift">
      {issue.photo && (
        <Card.Img
          variant="top"
          src={`${API_URL}${issue.photo}`}
          style={{ height: 200, objectFit: "cover" }}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0 text-truncate" title={issue.title}>{issue.title}</Card.Title>
          <Badge bg={badge} className="text-uppercase">{issue.priority}</Badge>
        </div>
        <Card.Subtitle className="mb-2 text-muted small">
          <strong>Status:</strong> {issue.status}
        </Card.Subtitle>
        <Card.Text className="small flex-grow-1">
          <div className="text-truncate-2">{issue.description}</div>
          <div className="mt-2 text-muted">
            <strong>By:</strong> {issue.reporter_name || "Anonymous"} • {new Date(issue.created_at).toLocaleString()}
          </div>
          {issue.location && <div className="text-muted"><strong>Location:</strong> {issue.location}</div>}
        </Card.Text>
        <div className="d-flex gap-2">
          <Button size="sm" variant="success" onClick={() => onLike(issue.id)}>
            <FaThumbsUp className="me-1" /> {issue.likes_count || 0}
          </Button>
          <Button size="sm" variant="warning" href={`/issues/${issue.id}/edit`}>
            <FaEdit className="me-1" /> Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(issue.id)}>
            <FaTrash className="me-1" /> Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
