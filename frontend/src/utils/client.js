const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export async function apiFetch(endpoint, options = {}) {
  const access = localStorage.getItem("access");

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: access ? `Bearer ${access}` : "",
      ...(options.headers || {}),
    },
  });

  // If token expired → refresh it
  if (res.status === 401) {
    const refresh = localStorage.getItem("refresh");

    if (!refresh) {
      window.location.href = "/login";
      return;
    }

    const refreshRes = await fetch(`${API_BASE}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!refreshRes.ok) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    const refreshData = await refreshRes.json();
    localStorage.setItem("access", refreshData.access);

    // retry original request
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshData.access}`,
        ...(options.headers || {}),
      },
    });
  }

  return res;
}