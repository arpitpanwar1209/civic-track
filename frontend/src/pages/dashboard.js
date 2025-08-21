import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      alert("You must log in first!");
      window.location.href = "/login";
      return;
    }

    fetch("http://127.0.0.1:8000/api/user/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Auth error:", err));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <p>Welcome, {user.username}! 🎉 (Role: {user.role})</p>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
}
