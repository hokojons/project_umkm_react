/**
 * API Configuration
 * 
 * Setup Laravel Backend:
 * 1. Set VITE_API_BASE_URL in your .env file
 * 2. For local development: VITE_API_BASE_URL=http://localhost:8000/api
 * 3. For production: VITE_API_BASE_URL=https://your-domain.com/api
 */

export const API_CONFIG = {
  // Base URL for Laravel API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  
  // Request timeout (30 seconds)
  TIMEOUT: 30000,
  
  // Enable/disable mock mode (for development without Laravel)
  MOCK_MODE: import.meta.env.VITE_MOCK_MODE === 'true' || false,
};

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
