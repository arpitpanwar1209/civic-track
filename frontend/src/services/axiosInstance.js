// src/services/axiosInstance.js
import axios from "axios";

/**
 * Backend base (versioned)
 * DO NOT append /api/v1 anywhere else
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

/* =============================
   MAIN API INSTANCE
============================= */
const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =============================
   REFRESH TOKEN INSTANCE
   (NO INTERCEPTORS!)
============================= */
const refreshClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =============================
   REQUEST INTERCEPTOR
============================= */
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

/* =============================
   RESPONSE INTERCEPTOR
============================= */
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
        emitLogout();
        return Promise.reject(error);
      }

      try {
        const res = await refreshClient.post(
          "/token/refresh/",
          { refresh }
        );

        const { access } = res.data;
        if (!access) throw new Error("No access token");

        localStorage.setItem("access", access);

        // Update headers
        axiosInstance.defaults.headers.common.Authorization =
          `Bearer ${access}`;
        originalRequest.headers.Authorization =
          `Bearer ${access}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Token refresh failed:", err);
        emitLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

/* =============================
   LOGOUT SIGNAL (NO ROUTING)
============================= */
function emitLogout() {
  localStorage.clear();
  window.dispatchEvent(new Event("auth:logout"));
}

export default axiosInstance;
