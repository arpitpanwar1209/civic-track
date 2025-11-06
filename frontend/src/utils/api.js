// src/utils/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

async function getStoredTokens() {
  return {
    access: localStorage.getItem("access"),
    refresh: localStorage.getItem("refresh"),
  };
}

async function saveTokens({ access, refresh }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!res.ok) throw new Error("refresh_failed");
  return res.json(); // { access: "...", refresh: "..." (maybe) }
}

export async function apiFetch(path, options = {}) {
  const { access, refresh } = await getStoredTokens();
  const headers = options.headers || {};
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // If access token expired -> try refresh once
  if (res.status === 401 && refresh) {
    try {
      const tokenRes = await refreshAccessToken(refresh);
      if (tokenRes.access) {
        await saveTokens({ access: tokenRes.access, refresh: tokenRes.refresh ?? refresh });
        // retry original request with new token
        headers["Authorization"] = `Bearer ${tokenRes.access}`;
        const retry = await fetch(`${API_URL}${path}`, { ...options, headers });
        return handleJsonOrError(retry);
      }
    } catch (err) {
      // refresh failed — force logout
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      throw new Error("SessionExpired");
    }
  }

  return handleJsonOrError(res);
}

async function handleJsonOrError(res) {
  // Attempt to parse JSON; if non-json (HTML error page) return a structured error.
  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    const json = await res.json();
    if (!res.ok) {
      const err = new Error(json.detail || JSON.stringify(json));
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return json;
  } else {
    // non-JSON (likely HTML) -> produce useful error
    const text = await res.text();
    const err = new Error(`Non-JSON response (status ${res.status})`);
    err.status = res.status;
    err.body = text.slice(0, 1000); // first 1000 chars
    throw err;
  }
}
