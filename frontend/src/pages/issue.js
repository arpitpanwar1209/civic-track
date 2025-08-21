import React, { useState, useEffect } from "react";

export default function Issue() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/issues/")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data);
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
