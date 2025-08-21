import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "consumer",
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
      const res = await fetch("http://127.0.0.1:8000/accounts/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess("🎉 Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500); // redirect after 1.5s
      } else {
        const data = await res.json();
        setError(data.detail || JSON.stringify(data));
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Signup</h2>

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
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br /><br />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="consumer">Consumer</option>
          <option value="provider">Provider</option>
        </select><br /><br />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
