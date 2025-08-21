import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://127.0.0.1:8000/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        setSuccess("✅ Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>

      {success && (
        <p style={{ color: "green", fontWeight: "bold" }}>{success}</p>
      )}
      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
