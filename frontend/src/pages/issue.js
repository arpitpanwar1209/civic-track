import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";

// 1. ADD THIS LINE
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function Issue() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
<Container className="py-4">
  <BackButton />
  {/* rest of content */}
</Container>

  useEffect(() => {
    // 2. CHANGE THIS LINE
    fetch(`${API_URL}/api/issues/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data); // 🔍 Debugging
        if (Array.isArray(data)) {
          setIssues(data);
        } else if (data.results) {
          setIssues(data.results);
        } else {
          setIssues([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching issues:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>All Issues</h2>
      {loading ? (
        <p>Loading...</p>
      ) : issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <ul>
          {issues.map((issue) => (
            <li key={issue.id}>{issue.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}