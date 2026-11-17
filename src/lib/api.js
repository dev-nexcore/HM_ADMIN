import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PROD_API_URL, // direct API calls
  headers: { Accept: "application/json" },
});

// attach token per request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle 401 / 403 gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("Admin session unauthorized or expired:", error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;