// src/services/issueService.js
import api from "./axios";

/**
 * NOTE:
 * axios instance MUST have:
 * baseURL = http://host/api/v1
 */

// --------------------------------------------------
// Create issue (multipart)
// --------------------------------------------------
export const createIssue = (formData) =>
  api.post("/reports/issues/", formData); // DO NOT set Content-Type manually

// --------------------------------------------------
// Fetch issues (consumer or provider)
// --------------------------------------------------
export const getIssues = () =>
  api.get("/reports/issues/");

// --------------------------------------------------
// Fetch nearby issues
// /reports/issues/?nearby=lat,lon&radius_km=5
// --------------------------------------------------
export const getNearbyIssues = (lat, lon, radiusKm = 5) =>
  api.get(
    `/reports/issues/?nearby=${lat},${lon}&radius_km=${radiusKm}`
  );

// --------------------------------------------------
// Update issue (used for resolve, edit, status change)
// --------------------------------------------------
export const updateIssue = (id, payload) =>
  api.patch(`/reports/issues/${id}/`, payload);

// --------------------------------------------------
// OPTIONAL ACTIONS (ONLY if backend supports them)
// --------------------------------------------------
export const claimIssue = (id) =>
  api.post(`/reports/issues/${id}/claim/`);

export const likeIssue = (id) =>
  api.post(`/reports/issues/${id}/like/`);
