/**
 * Authentication Service
 * Handles user authentication with Laravel API
 */

import { apiClient, extractData } from './api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserData,
  ApiResponse 
} from '../types/api';

export const authService = {
  /**
   * Login user
   * POST /api/auth/login
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return extractData(response);
  },

  /**
   * Register new user
   * POST /api/auth/register
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      userData
    );
    return extractData(response);
  },

  /**
   * Logout user
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get current authenticated user
   * GET /api/auth/user
   */
  getCurrentUser: async (): Promise<UserData> => {
    const response = await apiClient.get<ApiResponse<UserData>>('/auth/user');
    return extractData(response);
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
    return extractData(response);
  },

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  updateProfile: async (data: Partial<UserData>): Promise<UserData> => {
    const response = await apiClient.put<ApiResponse<UserData>>('/auth/profile', data);
    return extractData(response);
  },

  /**
   * Change password
   * PUT /api/auth/password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    });
  },
};
