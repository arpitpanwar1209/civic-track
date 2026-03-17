// src/auth/AuthContext.jsx

import { createContext, useEffect, useState, useCallback } from "react";

export const AuthContext = createContext(null);

const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

let refreshPromise = null;

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // Save Tokens
  // ============================================

  const saveTokens = useCallback((access, refresh) => {

    localStorage.setItem("access", access);

    if (refresh) {
      localStorage.setItem("refresh", refresh);
    }

  }, []);

  const setAccess = useCallback((access) => {
    localStorage.setItem("access", access);
  }, []);

  // ============================================
  // Logout
  // ============================================

  const logout = useCallback(() => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setUser(null);

  }, []);

  // ============================================
  // Refresh Access Token (with lock)
  // ============================================

  const refreshAccessToken = useCallback(async () => {

    if (refreshPromise) return refreshPromise;

    const refresh = localStorage.getItem("refresh");

    if (!refresh) throw new Error("No refresh token");

    refreshPromise = fetch(`${API_BASE}/token/refresh/`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ refresh })

    })
      .then(async (res) => {

        if (!res.ok) throw new Error("Refresh failed");

        const data = await res.json();

        localStorage.setItem("access", data.access);

        if (data.refresh) {
          localStorage.setItem("refresh", data.refresh);
        }

        return data.access;

      })
      .finally(() => {

        refreshPromise = null;

      });

    return refreshPromise;

  }, []);

  // ============================================
  // Authenticated Fetch
  // ============================================

  const authedFetch = useCallback(

    async (path, options = {}) => {

      const cleanPath = path.startsWith("/")
        ? path
        : `/${path}`;

      const url = path.startsWith("http")
        ? path
        : `${API_BASE}${cleanPath}`;

      const makeRequest = (token) => {

        const headers = {
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

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

      if (res.status === 401) {

        try {

          token = await refreshAccessToken();

          res = await makeRequest(token);

        } catch (err) {

          console.error("Auth refresh failed:", err);

          logout();

          throw err;

        }

      }

      return res;

    },

    [refreshAccessToken, logout]

  );

  // ============================================
  // Load User Profile
  // ============================================

  const loadUser = useCallback(async () => {

    const token = localStorage.getItem("access");

    if (!token) {

      setLoading(false);

      return;

    }

    try {

      const res = await authedFetch("/accounts/profile/");

      if (!res.ok) throw new Error("Profile request failed");

      const data = await res.json();

      setUser(data);

    } catch (err) {

      console.error("Profile load failed:", err);

      logout();

    } finally {

      setLoading(false);

    }

  }, [authedFetch, logout]);

  // ============================================
  // Initialize Auth
  // ============================================

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