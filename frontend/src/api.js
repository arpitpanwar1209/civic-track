// src/services/axiosInstance.js
import axios from "axios";

/**
 * Backend base (versioned)
 * DO NOT add /api/v1 anywhere else
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// --------------------------------------------------
// Request interceptor: attach access token
// --------------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------------------------------------
// Response interceptor: refresh on 401
// --------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        forceLogout();
        return Promise.reject(error);
      }

      try {
        // IMPORTANT: use same axios instance
        const res = await axiosInstance.post(
          "/token/refresh/",
          { refresh }
        );

        const { access } = res.data;

        if (!access) throw new Error("No access token");

        localStorage.setItem("access", access);
        axiosInstance.defaults.headers.common.Authorization =
          `Bearer ${access}`;

        originalRequest.headers.Authorization =
          `Bearer ${access}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Token refresh failed:", err);
        forceLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// --------------------------------------------------
// Force logout helper
// --------------------------------------------------
function forceLogout() {
  localStorage.clear();
  window.location.href = "/login";
}

export default axiosInstance;
