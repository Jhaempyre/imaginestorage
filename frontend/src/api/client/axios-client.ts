import axios from "axios";

// Create a pre-configured Axios instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000, // 10s timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for auth
});

// ✅ Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Since we're using cookie-based auth, we don't need to manually add tokens
    // The cookies will be automatically included due to withCredentials: true
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Could trigger logout or token refresh here
      console.warn('Unauthorized request - user may need to login');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
