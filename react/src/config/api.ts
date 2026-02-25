
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_CONFIG = {
  // Base URL for Laravel API (includes /api)
  BASE_URL: RAW_BASE_URL,

  // Base host URL (tanpa /api) - untuk URL gambar/file
  BASE_HOST: RAW_BASE_URL.replace(/\/api\/?$/, ''),

  // Request timeout (30 seconds)
  TIMEOUT: 30000,

  // Enable/disable mock mode (for development without Laravel)
  MOCK_MODE: import.meta.env.VITE_MOCK_MODE === 'true' || false,
};

// Shorthand exports untuk kemudahan import
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const BASE_HOST = API_CONFIG.BASE_HOST;

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
