// src/auth/AuthContext.jsx
import { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Logout
  // =====================================================
  const logout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  // =====================================================
  // Refresh access token
  // =====================================================
  const refreshAccessToken = useCallback(async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("No refresh token");

    const res = await fetch(`${API_BASE}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    localStorage.setItem("access", data.access);
    return data.access;
  }, []);

  // =====================================================
  // Authenticated fetch (FORMDATA SAFE)
  // =====================================================
  const authedFetch = useCallback(
    async (path, options = {}) => {
      const url = path.startsWith("http")
        ? path
        : `${API_BASE}${path}`;

      const isFormData = options.body instanceof FormData;

      const makeRequest = (token) =>
        fetch(url, {
          ...options,
          headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      let token = localStorage.getItem("access");
      let res = await makeRequest(token);

      if (res.status === 401) {
        try {
          token = await refreshAccessToken();
          res = await makeRequest(token);
        } catch {
          logout();
          throw new Error("Authentication failed");
        }
      }

      return res;
    },
    [refreshAccessToken, logout]
  );

  // =====================================================
  // Load user
  // =====================================================
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authedFetch("/accounts/profile/");
      if (!res.ok) throw new Error();

      const data = await res.json();
      setUser(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [authedFetch, logout]);

  // =====================================================
  // Init
  // =====================================================
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authedFetch,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
