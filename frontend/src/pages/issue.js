import React, { useEffect, useState } from "react";

function Issues() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/issues/")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>Community Issues</h2>
      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p>No issues reported yet.</p>
      ) : (
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {reports.map((report) => (
            <div 
              key={report.id} 
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                background: "#fff",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#2c3e50" }}>
                {report.title}
              </h3>
              <p><strong>Status:</strong> {report.status}</p>
              <p><strong>Priority:</strong> {report.priority}</p>
              <p style={{ fontSize: "14px", color: "#555" }}>
                {report.description}
              </p>
              {report.latitude && report.longitude && (
                <p style={{ fontSize: "12px", color: "#777" }}>
                  📍 {report.latitude}, {report.longitude}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Issues;
