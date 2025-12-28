import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

/**
 * Backend base = http://host/api/v1
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export default function SubmitIssue({ onSubmitted }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    photo: null,
    priority: "medium",
  });

  const [predictedCategory, setPredictedCategory] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access");

  // --------------------------------------------------
  // Handle input change
  // --------------------------------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Trigger ML prediction
    if (name === "description" && value.trim().length > 10) {
      predictCategory(value);
    }
  };

  // --------------------------------------------------
  // Predict category (ML)
  // --------------------------------------------------
  const predictCategory = async (description) => {
    try {
      setLoadingPrediction(true);

      const res = await fetch(
        `${API_BASE}/reports/predict-category/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify({ description }),
        }
      );

      const data = await res.json();

      if (res.ok && data.predicted_category) {
        setPredictedCategory(data.predicted_category);
        setFormData((prev) => ({
          ...prev,
          category: data.predicted_category,
        }));
      } else {
        setPredictedCategory(null);
      }
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  // --------------------------------------------------
  // Submit issue
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("⚠️ You must be logged in to submit an issue.");
      return;
    }

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "")
        submitData.append(key, value);
    });

    try {
      const res = await fetch(
        `${API_BASE}/reports/issues/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitData,
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.detail || "⚠️ Failed to submit issue.");
        return;
      }

      setSuccess("✅ Issue submitted successfully!");

      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        photo: null,
        priority: "medium",
      });
      setPredictedCategory(null);

      if (typeof onSubmitted === "function") {
        onSubmitted(data);
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Network error while submitting issue.");
    }
  };

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <Form
      onSubmit={handleSubmit}
      className="p-3 shadow-sm rounded bg-light"
    >
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        {loadingPrediction && (
          <div className="mt-2 text-muted small">
            <Spinner animation="border" size="sm" /> Detecting
            category…
          </div>
        )}

        {predictedCategory && (
          <Alert variant="info" className="mt-2 py-2">
            🤖 Suggested Category:{" "}
            <strong>{predictedCategory}</strong>
          </Alert>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="road">Road</option>
          <option value="garbage">Garbage</option>
          <option value="water">Water Supply</option>
          <option value="electricity">Electricity</option>
          <option value="sewage">Sewage</option>
          <option value="lighting">Street Lighting</option>
          <option value="pollution">Pollution</option>
          <option value="traffic">Traffic</option>
          <option value="other">Other</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Location</Form.Label>
        <Form.Control
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Optional"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Photo</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          name="photo"
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Priority</Form.Label>
        <Form.Select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Form.Select>
      </Form.Group>

      <Button type="submit" className="w-100">
        Submit Issue
      </Button>
    </Form>
  );
}
