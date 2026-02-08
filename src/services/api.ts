
import axios from "axios";

// Use environment variable for production, fallback to local for development
const getBaseURL = () => {
  // Check if we have a production API URL from environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development fallback URLs
  const possibleBaseURLs = [
    "/api", // Proxy (if available)
    "http://127.0.0.1:5000/api",
    "http://localhost:5000/api",
    `http://${window.location.hostname}:5000/api`
  ];
  
  return possibleBaseURLs[0];
};

const baseURL = getBaseURL();

// Test connectivity for development only
const testConnection = async () => {
  if (import.meta.env.VITE_API_URL) {
    console.log(`Using production API: ${baseURL}`);
    return;
  }
  
  const possibleBaseURLs = [
    "/api",
    "http://127.0.0.1:5000/api",
    "http://localhost:5000/api",
    `http://${window.location.hostname}:5000/api`
  ];
  
  for (const url of possibleBaseURLs) {
    try {
      const testApi = axios.create({ baseURL: url, timeout: 2000 });
      await testApi.get('/test');
      console.log(`Using API base URL: ${url}`);
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
