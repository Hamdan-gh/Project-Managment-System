import axios from "axios";

// -------------------------------------------------------
// Base URL resolution
// Priority: VITE_API_URL env var → Vite proxy (/api)
// -------------------------------------------------------
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.PROD) {
    return "/api";
  }
  return "/api"; // local dev: Vite proxy forwards to http://127.0.0.1:5000
};

const baseURL = getBaseURL();
console.log(`[API] Base URL: ${baseURL}`);

// -------------------------------------------------------
// Axios instance
// -------------------------------------------------------
export const api = axios.create({
  baseURL,
  timeout: 90000, // 90s — accounts for Render free-tier cold start (~50s)
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unified error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    if (!url.includes("/test")) {
      console.error("[API] Error:", error.response?.data?.msg ?? error.message);
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------
// Wake-up ping for Render free tier
// Sends a lightweight request on app load so the backend
// is warm by the time the user tries to log in.
// -------------------------------------------------------
const wakeUpBackend = async () => {
  try {
    console.log("[API] Pinging backend to wake it up...");
    await api.get("/test", { timeout: 90000 });
    console.log("[API] Backend is awake and ready.");
  } catch {
    console.warn("[API] Backend wake-up ping failed — it may still be starting. Requests will retry.");
  }
};

wakeUpBackend();
