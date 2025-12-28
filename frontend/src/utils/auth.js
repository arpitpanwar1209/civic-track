// src/utils/getAccessToken.js

/**
 * Backend base (versioned)
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

function safeDecodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export async function getAccessToken() {
  let access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  if (!access || !refresh) {
    throw new Error("UserNotAuthenticated");
  }

  const payload = safeDecodeJwt(access);

  // If token is invalid, force logout
  if (!payload || !payload.exp) {
    localStorage.clear();
    throw new Error("InvalidToken");
  }

  const expiryMs = payload.exp * 1000;

  // Token still valid
  if (Date.now() < expiryMs) {
    return access;
  }

  // --------------------------------------------------
  // Refresh access token
  // --------------------------------------------------
  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    localStorage.clear();
    throw new Error("SessionExpired");
  }

  const data = await res.json();

  if (!data.access) {
    localStorage.clear();
    throw new Error("InvalidRefreshResponse");
  }

  localStorage.setItem("access", data.access);
  return data.access;
}
