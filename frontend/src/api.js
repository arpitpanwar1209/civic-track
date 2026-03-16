import axios from "axios";

/**
 * Backend base (versioned)
 */
const API_BASE =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Attach access token
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

// Refresh token logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        forceLogout();
        return Promise.reject(error);
      }

      try {
        const res = await axiosInstance.post("/token/refresh/", { refresh });

        const { access } = res.data;

        localStorage.setItem("access", access);

        axiosInstance.defaults.headers.common.Authorization =
          `Bearer ${access}`;

        originalRequest.headers.Authorization = `Bearer ${access}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        forceLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

function forceLogout() {
  localStorage.clear();
  window.location.href = "/login";
}

export default axiosInstance;