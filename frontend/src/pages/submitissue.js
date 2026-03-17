// src/components/SubmitIssue.jsx

import React, { useState, useContext, useRef, useEffect } from "react";
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

  // ==========================================
  // Get current location automatically
  // ==========================================
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
      },
      () => {
        console.warn("Location permission denied");
      }
    );

    return () => clearTimeout(predictTimer.current);
  }, []);

  // ==========================================
  // Validation
  // ==========================================
  const validate = () => {
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.description.trim()) return "Description is required.";
    if (!formData.category) return "Category is required.";
    return null;
  };

  // ==========================================
  // Predict category
  // ==========================================
  const predictCategory = async (description) => {
    try {
      setLoadingPrediction(true);

      const res = await authedFetch("/reports/predict-category/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // ==========================================
  // Handle form input
  // ==========================================
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

    // Debounced AI prediction
    if (name === "description" && value.trim().length > 20) {
      clearTimeout(predictTimer.current);

      predictTimer.current = setTimeout(() => {
        predictCategory(value);
      }, 600);
    }
  };

  // ==========================================
  // Submit Issue
  // ==========================================
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

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="w-100">
      <Form onSubmit={handleSubmit}>
        
        {success && (
          <Alert variant="success" className="border-0 shadow-sm mb-4 rounded-3 border-start border-success border-4">
            <span className="fw-medium">{success}</span>
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger" className="border-0 shadow-sm mb-4 rounded-3 border-start border-danger border-4">
            <span className="fw-medium">{error}</span>
          </Alert>
        )}

        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
            Issue Title
          </Form.Label>
          <Form.Control
            className="py-2"
            name="title"
            placeholder="E.g., Large pothole on 5th Avenue"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <div className="d-flex justify-content-between align-items-end mb-1">
            <Form.Label className="fw-semibold text-dark small text-uppercase mb-0" style={{ letterSpacing: '0.5px' }}>
              Detailed Description
            </Form.Label>
            {loadingPrediction && (
              <span className="text-primary small fw-medium d-flex align-items-center">
                <Spinner animation="grow" size="sm" className="me-2" />
                Analyzing text...
              </span>
            )}
          </div>
          
          <Form.Control
            as="textarea"
            rows={4}
            className="py-2"
            name="description"
            placeholder="Describe the issue in detail..."
            value={formData.description}
            onChange={handleChange}
            required
          />

          {predictedCategory && (
            <div className="mt-2 bg-light border border-info rounded-2 px-3 py-2 d-flex align-items-center">
              <span className="text-info me-2 fs-5">💡</span>
              <span className="small text-dark fw-medium">
                AI Suggestion: <strong className="text-info text-uppercase tracking-wide">{predictedCategory}</strong>
              </span>
            </div>
          )}
        </Form.Group>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                Category
              </Form.Label>
              <Form.Select
                className="py-2"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">-- Select --</option>
                <option value="road">Road</option>
                <option value="garbage">Garbage</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
                <option value="sewage">Sewage</option>
                <option value="lighting">Street Lighting</option>
                <option value="pollution">Pollution</option>
                <option value="traffic">Traffic</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </div>
          
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                Priority Level
              </Form.Label>
              <Form.Select
                className="py-2"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
            Attach Photo Evidence
          </Form.Label>
          <Form.Control
            className="py-2"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            name="image"
            onChange={handleChange}
          />
        </Form.Group>

        <Button
          type="submit"
          variant="dark"
          className="w-100 py-2 mt-3 rounded-pill fw-bold shadow-sm transition-hover"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Submitting Report...
            </>
          ) : (
            "Submit Issue"
          )}
        </Button>
      </Form>
    </div>
  );
}