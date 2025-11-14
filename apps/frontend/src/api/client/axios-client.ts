import axios from "axios";
import { ErrorInterceptor } from "../error/interceptor";
import { API_URL } from "@/config";

// Create a pre-configured Axios instance
const axiosClient = axios.create({
  baseURL: API_URL || "http://localhost:3000",
  timeout: 10000, // 10s timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for auth
});

// Add metadata property to axios config type
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime?: number;
      requestId?: string;
      [key: string]: any;
    };
  }
}

// ✅ Request Interceptors with Error Handling
axiosClient.interceptors.request.use(
  ErrorInterceptor.onRequest,
  ErrorInterceptor.onRequestError,
);

// ✅ Response Interceptors with Error Handling
axiosClient.interceptors.response.use(
  ErrorInterceptor.onResponse,
  ErrorInterceptor.onResponseError,
);

export default axiosClient;
