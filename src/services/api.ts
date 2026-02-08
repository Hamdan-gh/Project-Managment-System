
import axios from "axios";

// Try different base URLs in order of preference
const possibleBaseURLs = [
  "/api", // Proxy (if available)
  "http://127.0.0.1:5000/api",
  "http://localhost:5000/api",
  `http://${window.location.hostname}:5000/api`
];

let baseURL = possibleBaseURLs[0];

// Test connectivity and fallback if needed
const testConnection = async () => {
  for (const url of possibleBaseURLs) {
    try {
      const testApi = axios.create({ baseURL: url, timeout: 2000 });
      await testApi.get('/test');
      baseURL = url;
      console.log(`Using API base URL: ${baseURL}`);
      break;
    } catch (error) {
      // Silently try next URL
    }
  }
};

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log actual API errors, not network connectivity issues during testing
    if (error.config && !error.config.url?.includes('/test')) {
      console.error('API Error:', error.response?.data?.msg || error.message);
    }
    return Promise.reject(error);
  }
);

// Test connection on module load
testConnection();
