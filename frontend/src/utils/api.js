// src/utils/api.js

/**
 * Backend API base (versioned)
 * NEVER append /api/v1 anywhere else in the app.
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

// --------------------------------------------------
// Token helpers
// --------------------------------------------------
function getStoredTokens() {
  return {
    access: localStorage.getItem("access"),
    refresh: localStorage.getItem("refresh"),
  };
}

function saveTokens({ access, refresh }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

// --------------------------------------------------
// Refresh access token
// --------------------------------------------------
async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) {
    throw new Error("refresh_failed");
  }

  return res.json(); // { access }
}

// --------------------------------------------------
// Main API fetch wrapper
// --------------------------------------------------
export async function apiFetch(path, options = {}) {
  const { access, refresh } = getStoredTokens();

  const headers = {
    ...(options.headers || {}),
  };

  // Auto JSON header unless FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] =
      headers["Content-Type"] || "application/json";
  }

  if (access) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  const request = () =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

  let res = await request();

  // --------------------------------------------------
  // Retry once on expired access token
  // --------------------------------------------------
  if (res.status === 401 && refresh) {
    try {
      const tokenRes = await refreshAccessToken(refresh);
      saveTokens({ access: tokenRes.access });

      headers["Authorization"] = `Bearer ${tokenRes.access}`;
      res = await request();
    } catch (err) {
      clearTokens();
      throw new Error("SessionExpired");
    }
  }

  return handleResponse(res);
}

// --------------------------------------------------
// Response handler
// --------------------------------------------------
async function handleResponse(res) {
  const contentType = res.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(
        data.detail || "API request failed"
      );
      err.status = res.status;
      err.body = data;
      throw err;
    }

    return data;
  }

  // Non-JSON (HTML, proxy error, etc.)
  const text = await res.text();
  const err = new Error(
    `Non-JSON response (status ${res.status})`
  );
  err.status = res.status;
  err.body = text.slice(0, 1000);
  throw err;
}
