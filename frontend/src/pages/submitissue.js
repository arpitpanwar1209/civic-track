import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import BackButton from "../components/BackButton";

export default function SubmitIssue() {
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

  
<Container className="py-4">
  <BackButton />
  {/* rest of content */}
</Container>

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // 🧠 Trigger prediction when typing description
    if (name === "description" && value.length > 10) {
      predictCategory(value);
    }
  };

  // 🔹 AI Category Prediction
  const predictCategory = async (description) => {
    try {
      setLoadingPrediction(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/predict-category/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (res.ok && data.predicted_category) {
        setPredictedCategory(data.predicted_category);
        setFormData({ ...formData, category: data.predicted_category });
      } else {
        setPredictedCategory(null);
      }
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  // 🔹 Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const submitData = new FormData();
    for (const key in formData) {
      submitData.append(key, formData[key]);
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/issues/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (res.ok) {
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
      } else {
        setError("Failed to submit issue.");
      }
    } catch (err) {
      setError("Error submitting issue.");
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 shadow-sm rounded bg-light">
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter a short title"
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
          placeholder="Describe the issue in detail"
          required
        />
        {loadingPrediction && (
          <div className="mt-2 text-muted small">
            <Spinner animation="border" size="sm" /> Analyzing description...
          </div>
        )}
        {predictedCategory && (
          <Alert variant="info" className="mt-2">
            🤖 Suggested Category: <strong>{predictedCategory}</strong>
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
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter location (optional)"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Photo</Form.Label>
        <Form.Control type="file" name="photo" onChange={handleChange} />
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

      <Button type="submit" variant="primary" className="w-100">
        Submit Issue
      </Button>
    </Form>
    
  );
}
