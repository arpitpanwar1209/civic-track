import React, { useState, useContext, useRef } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { AuthContext } from "../auth/AuthContext";

export default function SubmitIssue({ onSubmitted }) {

  const { authedFetch } = useContext(AuthContext);

  const predictTimer = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    latitude: "",
    longitude: "",
    image: null,
    priority: "medium",
  });

  const [predictedCategory, setPredictedCategory] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // -----------------------------
  // Validation
  // -----------------------------
  const validate = () => {
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.description.trim()) return "Description is required.";
    if (!formData.category) return "Category is required.";
    return null;
  };

  // -----------------------------
  // Predict category
  // -----------------------------
  const predictCategory = async (description) => {

    try {

      setLoadingPrediction(true);

      const res = await authedFetch("/reports/predict-category/", {
        method: "POST",
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (res.ok && data.category) {
        setPredictedCategory(data.category);

        setFormData(prev => ({
          ...prev,
          category: data.category
        }));
      }

    } catch (err) {

      console.error("Prediction error:", err);

    } finally {

      setLoadingPrediction(false);

    }

  };

  // -----------------------------
  // Handle input
  // -----------------------------
  const handleChange = (e) => {

    const { name, value, files } = e.target;

    setSuccess(null);
    setError(null);

    if (name === "image") {

      setFormData(prev => ({
        ...prev,
        image: files?.[0] || null
      }));

      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "description" && value.trim().length > 20) {

      clearTimeout(predictTimer.current);

      predictTimer.current = setTimeout(() => {
        predictCategory(value);
      }, 600);

    }

  };

  // -----------------------------
  // Submit issue
  // -----------------------------
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const submitData = new FormData();

    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("priority", formData.priority);

    if (formData.image) {
      submitData.append("image", formData.image);
    }

    if (formData.latitude) {
      submitData.append("latitude", formData.latitude);
    }

    if (formData.longitude) {
      submitData.append("longitude", formData.longitude);
    }

    try {

      const res = await authedFetch("/reports/consumer/issues/", {
        method: "POST",
        body: submitData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to submit issue.");
        return;
      }

      setSuccess("Issue submitted successfully!");

      setFormData({
        title: "",
        description: "",
        category: "",
        latitude: "",
        longitude: "",
        image: null,
        priority: "medium",
      });

      setPredictedCategory(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (typeof onSubmitted === "function") {
        onSubmitted(data);
      }

    } catch (err) {

      console.error(err);
      setError("Network error while submitting issue.");

    } finally {

      setSubmitting(false);

    }

  };

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
            <Spinner animation="border" size="sm" /> Detecting category…
          </div>
        )}

        {predictedCategory && (
          <Alert variant="info" className="mt-2 py-2">
            Suggested Category: <strong>{predictedCategory}</strong>
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

        <Form.Label>Latitude</Form.Label>

        <Form.Control
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          placeholder="Optional"
        />

      </Form.Group>

      <Form.Group className="mb-3">

        <Form.Label>Longitude</Form.Label>

        <Form.Control
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          placeholder="Optional"
        />

      </Form.Group>

      <Form.Group className="mb-3">

        <Form.Label>Photo</Form.Label>

        <Form.Control
          ref={fileInputRef}
          type="file"
          accept="image/*"
          name="image"
          onChange={handleChange}
        />

      </Form.Group>

      <Form.Group className="mb-4">

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

      <Button
        type="submit"
        className="w-100"
        disabled={submitting}
      >
        {submitting ? "Submitting…" : "Submit Issue"}
      </Button>

    </Form>
  );
}