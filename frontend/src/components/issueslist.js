import React, { useEffect, useState } from "react";

function IssuesList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/reports/")
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

  if (loading) {
    return <p className="text-center mt-10">Loading issues...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold text-gray-800">{issue.title}</h2>
          <p className="text-sm text-gray-600">{issue.description}</p>
          <p className="mt-2 text-xs">
            <span className="font-semibold">Category:</span> {issue.category}
          </p>
          <p className="text-xs">
            <span className="font-semibold">Priority:</span> {issue.priority}
          </p>
          <p className="text-xs">
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded text-white ${
                issue.status === "resolved"
                  ? "bg-green-500"
                  : issue.status === "pending"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
            >
              {issue.status}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

export default IssuesList;
