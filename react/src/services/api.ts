/**
 * Base API Client
 * Axios configuration for Laravel API communication
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "../config/api";
import { ApiResponse } from "../types/api";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Disable automatic decompression which can cause protocol issues
  decompress: false,
  // Validate status to accept 2xx responses
  validateStatus: (status) => status >= 200 && status < 300,
});

// Request interceptor - Add auth token and user ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("pasar_umkm_access_token");
    const userStr = localStorage.getItem("pasar_umkm_current_user");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add X-User-ID header for backend
    if (userStr && config.headers) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id) {
          config.headers["X-User-ID"] = user.id;
        }
      } catch {
        // Ignore parse errors
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("pasar_umkm_access_token");
      localStorage.removeItem("pasar_umkm_current_user");

      // Redirect to login (can be handled by app)
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }

    // Handle validation errors
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        throw new Error(
          Array.isArray(firstError) ? firstError[0] : "Validation error"
        );
      }
    }

    // Handle server errors
    if (error.response?.status === 500) {
      const serverMessage = error.response?.data?.message || "Server error. Please try again later.";
      console.error("Server Error Details:", error.response?.data);
      throw new Error(serverMessage);
    }

    // Handle network errors - but don't throw generic error for protocol issues
    if (!error.response) {
      console.warn("Network/protocol error:", error.message);
      // Check if it's a protocol error (common with devtunnels)
      if (
        error.code === "ERR_HTTP2_PROTOCOL_ERROR" ||
        error.message?.includes("protocol")
      ) {
        throw new Error("Connection issue with server. Please try again.");
      }
      throw new Error("Network error. Please check your connection.");
    }

    // Return the error message from API
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    throw new Error(message);
  }
);

// Helper function to handle file uploads
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object") {
          Object.keys(item).forEach((subKey) => {
            formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
          });
        } else {
          formData.append(`${key}[]`, item);
        }
      });
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

// Helper function to extract API response
export const extractData = <T>(response: { data: ApiResponse<T> }): T => {
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Invalid response format");
};
