import React, { useState } from "react";
import { getAccessToken } from "../utils/auth";

function SubmitIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("road"); // ✅ required field
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

   
const token = await getAccessToken();

const res = await fetch("http://127.0.0.1:8000/api/issues/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ title, description, priority, category }),
});

   
    try {
      const res = await fetch("http://127.0.0.1:8000/api/issues/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          category,  // ✅ added
        }),
      });

      if (res.ok) {
  setMessage("✅ Issue submitted successfully!");
  setTitle("");
  setDescription("");
  setPriority("medium");
  setCategory("road");
} else {
  const errData = await res.json();
  console.error("❌ Server Response:", errData);   // show full error
  setMessage(`❌ Error: ${JSON.stringify(errData)}`);
}

    } catch (error) {
      console.error(error);
      setMessage("⚠️ Network error.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>📌 Submit an Issue</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />

        <textarea
          placeholder="Describe the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />

        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="road">Road</option>
          <option value="garbage">Garbage</option>
          <option value="water">Water Supply</option>
          <option value="electricity">Electricity</option>
          <option value="sewage">Sewage</option>
          <option value="lighting">Street Lighting</option>
          <option value="pollution">Pollution</option>
          <option value="traffic">Traffic</option>
          <option value="other">Other</option>
        </select>

        <label>Priority:</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <button type="submit" style={{ marginTop: "10px" }}>
          🚀 Submit
        </button>
      </form>
    </div>
  );
}

export default SubmitIssue;
