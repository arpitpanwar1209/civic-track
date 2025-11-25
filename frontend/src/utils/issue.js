import api from "./axios";

// Create Issue
export const createIssue = (data) =>
  api.post("/reports/issues/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Fetch Issues (consumer OR provider filtered automatically)
export const getIssues = () => api.get("/reports/issues/");

// Claim Issue (provider)
export const claimIssue = (id) => api.post(`/reports/issues/${id}/claim/`);

// Resolve Issue (provider)
export const resolveIssue = (id) => api.post(`/reports/issues/${id}/resolve/`);

// Like Issue
export const likeIssue = (id) => api.post(`/reports/issues/${id}/like/`);

// Geo filter: /reports/issues/?nearby=30.00,76.99&radius_km=5
export const getNearbyIssues = (lat, lon, radius) =>
  api.get(`/reports/issues/?nearby=${lat},${lon}&radius_km=${radius}`);
