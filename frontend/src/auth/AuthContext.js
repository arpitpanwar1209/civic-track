// src/auth/AuthContext.jsx

import { createContext, useEffect, useState, useCallback } from "react";

export const AuthContext = createContext(null);

const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Save Tokens
  // =====================================================
  const saveTokens = useCallback((access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
  }, []);

  const setAccess = useCallback((access) => {
    localStorage.setItem("access", access);
  }, []);

  // =====================================================
  // Logout
  // =====================================================
  const logout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  }, []);

  // =====================================================
  // Refresh Access Token
  // =====================================================
  const refreshAccessToken = useCallback(async () => {

    const refresh = localStorage.getItem("refresh");

    if (!refresh) throw new Error("No refresh token");

    const res = await fetch(`${API_BASE}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refresh })
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();

    localStorage.setItem("access", data.access);

    return data.access;

  }, []);

  // =====================================================
  // Authenticated Fetch
  // =====================================================
  const authedFetch = useCallback(
    async (path, options = {}) => {

      const url = path.startsWith("http")
        ? path
        : `${API_BASE}${path}`;

      const makeRequest = (token) => {

        const headers = {
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        // IMPORTANT: do not set content-type for FormData
        if (!(options.body instanceof FormData)) {
          headers["Content-Type"] = "application/json";
        }

        return fetch(url, {
          ...options,
          headers
        });
      };

      let token = localStorage.getItem("access");

      let res = await makeRequest(token);

      // If access token expired
      if (res.status === 401) {

        try {

          token = await refreshAccessToken();

          res = await makeRequest(token);

        } catch (err) {

          logout();

          throw new Error("Authentication failed");

        }
      }

      return res;

    },
    [refreshAccessToken, logout]
  );

  // =====================================================
  // Load User Profile
  // =====================================================
  const loadUser = useCallback(async () => {

    const token = localStorage.getItem("access");

    if (!token) {
      setLoading(false);
      return;
    }

    try {

      const res = await authedFetch("/accounts/profile/");

      if (!res.ok) throw new Error("Profile failed");

      const data = await res.json();

      setUser(data);

    } catch {

      logout();

    } finally {

      setLoading(false);

    }

  }, [authedFetch, logout]);

  // =====================================================
  // Init (Load user on app start)
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
        saveTokens,
        setAccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}