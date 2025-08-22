import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditIssue() {
  const { id } = useParams(); // issue id from URL
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("access");
  const API = `http://127.0.0.1:8000/api/issues/${id}/`;

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setIssue(data))
      .catch((err) => {
        console.error(err);
        setMsg("⚠️ Could not load issue");
      });
  }, [API, token]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setIssue((p) => ({ ...p, [name]: value }));
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setIssue((p) => ({ ...p, _file: f }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const form = new FormData();
      form.append("title", issue.title);
      form.append("description", issue.description);
      form.append("priority", issue.priority);
      form.append("category", issue.category);
      if (issue.location) form.append("location", issue.location);
      if (issue._file) form.append("photo", issue._file);

      const res = await fetch(API, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(err);
        setMsg("❌ Update failed");
      } else {
        setMsg("✅ Issue updated");
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (err) {
      console.error(err);
      setMsg("⚠️ Network error");
    } finally {
      setSaving(false);
    }
  };

  if (!issue) return <p>Loading issue...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2>Edit Issue</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={save} encType="multipart/form-data">
        <input
          type="text"
          name="title"
          value={issue.title}
          onChange={onChange}
          required
          placeholder="Title"
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />

        <textarea
          name="description"
          value={issue.description}
          onChange={onChange}
          required
          placeholder="Description"
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />

        <label>Category:</label>
        <select
          name="category"
          value={issue.category}
          onChange={onChange}
          style={{ display: "block", margin: "10px 0" }}
        >
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
        <select
          name="priority"
          value={issue.priority}
          onChange={onChange}
          style={{ display: "block", margin: "10px 0" }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <input
          type="text"
          name="location"
          value={issue.location || ""}
          onChange={onChange}
          placeholder="Location (optional)"
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />

        <label>Photo:</label>
        <input
          type="file"
          accept="image/*"
          onChange={onFile}
          style={{ display: "block", margin: "10px 0" }}
        />

        {issue.photo && (
          <div>
            <img
              src={
                issue.photo.startsWith("http")
                  ? issue.photo
                  : `http://127.0.0.1:8000${issue.photo}`
              }
              alt="Issue"
              width={200}
            />
          </div>
        )}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
