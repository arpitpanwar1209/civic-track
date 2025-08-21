import React, { useState } from "react";

export default function SubmitIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting issue:", title, description);

    // Example API call
    fetch("http://localhost:8000/api/issues/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Issue created:", data);
        setTitle("");
        setDescription("");
      })
      .catch((err) => console.error("Error:", err));
  };

  return (
    <div>
      <h2>Submit an Issue</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
