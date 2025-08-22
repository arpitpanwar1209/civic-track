import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SubmitIssue from "./submitissue";

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access");

  // 🔍 Fetch Issues
  const fetchIssues = () => {
    fetch("http://127.0.0.1:8000/api/issues/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setIssues(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching issues:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIssues();
  }, [token]);

  // ❌ Delete Issue
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    await fetch(`http://127.0.0.1:8000/api/issues/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setIssues(issues.filter((i) => i.id !== id));
  };

  // 👍 Like Issue
  const handleLike = async (id) => {
    const res = await fetch(`http://127.0.0.1:8000/api/issues/${id}/like/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const msg = await res.json();
    alert(msg.message);
    fetchIssues(); // refresh list after like/unlike
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Profile Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link
          to="/profile"
          style={{
            fontWeight: "bold",
            textDecoration: "none",
            background: "#3498db",
            color: "#fff",
            padding: "8px 15px",
            borderRadius: "5px",
          }}
        >
          👤 Profile
        </Link>
      </div>

      <h1 style={{ textAlign: "center", margin: "20px 0" }}>📋 Dashboard</h1>

      {/* Submit New Issue */}
      <div style={{ marginBottom: "30px" }}>
        <h2>➕ Submit a New Issue</h2>
        <SubmitIssue />
      </div>

      {/* Issues List */}
      <h2>📌 My Issues</h2>
      {loading ? (
        <p>Loading issues...</p>
      ) : issues.length === 0 ? (
        <p style={{ color: "gray" }}>No issues submitted yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {issues.map((issue) => (
            <div
              key={issue.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                background: "#fff",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>{issue.title}</h3>
              <p>
                <strong>Priority:</strong> {issue.priority} |{" "}
                <strong>Status:</strong> {issue.status}
              </p>
              <p>
                <strong>Reported by:</strong>{" "}
                {issue.reporter_name || "Anonymous"}
              </p>
              <p>
                <strong>Location:</strong> {issue.location || "Not specified"}
              </p>
              <p style={{ fontSize: "0.9em", color: "gray" }}>
                ⏰ {new Date(issue.created_at).toLocaleString()}
              </p>

              {/* Show photo */}
              {issue.photo ? (
                <img
                  src={`http://127.0.0.1:8000${issue.photo}`}
                  alt="Issue"
                  width="100%"
                  style={{
                    marginTop: "10px",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <p style={{ fontStyle: "italic", color: "gray" }}>
                  No photo uploaded
                </p>
              )}

              {/* Likes */}
              <p style={{ marginTop: "8px" }}>
                👍 {issue.likes_count || 0} likes
              </p>

              {/* Action Buttons */}
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => handleLike(issue.id)}
                  style={{
                    padding: "6px 12px",
                    marginRight: "8px",
                    borderRadius: "5px",
                    border: "none",
                    background: "#2ecc71",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  👍 Like
                </button>
                <Link
                  to={`/edit-issue/${issue.id}`}
                  style={{
                    padding: "6px 12px",
                    marginRight: "8px",
                    borderRadius: "5px",
                    background: "#f39c12",
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={() => handleDelete(issue.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "5px",
                    border: "none",
                    background: "#e74c3c",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
