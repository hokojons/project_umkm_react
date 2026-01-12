/**
 * Admin Service
 * Handles admin operations (user management, role upgrades, etc.)
 */

import { apiClient, extractData } from './api';
import {
  UpdateUserRoleRequest,
  RoleUpgradeRequestResponse,
  ReviewRoleUpgradeRequest,
  AdminStatsResponse,
  UserData,
  ApiResponse,
  PaginatedResponse,
} from '../types/api';

export const adminService = {
  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Get all users
   * GET /api/admin/users
   * Requires Admin role
   */
  getAllUsers: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<UserData[]> => {
    const response = await apiClient.get<ApiResponse<UserData[]>>(
      '/admin/users',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get paginated users
   * GET /api/admin/users/paginated
   * Requires Admin role
   */
  getUsersPaginated: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<UserData>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<UserData>>>(
      '/admin/users/paginated',
      { params }
    );
    return extractData(response);
  },

  /**
   * Update user role
   * PUT /api/admin/users/{userId}/role
   * Requires Admin role
   */
  updateUserRole: async (data: UpdateUserRoleRequest): Promise<UserData> => {
    const response = await apiClient.put<ApiResponse<UserData>>(
      `/admin/users/${data.user_id}/role`,
      { role: data.role }
    );
    return extractData(response);
  },

  /**
   * Delete user
   * DELETE /api/admin/users/{userId}
   * Requires Admin role
   */
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  /**
   * Suspend user
   * PUT /api/admin/users/{userId}/suspend
   * Requires Admin role
   */
  suspendUser: async (userId: string, reason?: string): Promise<UserData> => {
    const response = await apiClient.put<ApiResponse<UserData>>(
      `/admin/users/${userId}/suspend`,
      { reason }
    );
    return extractData(response);
  },

  /**
   * Unsuspend user
   * PUT /api/admin/users/{userId}/unsuspend
   * Requires Admin role
   */
  unsuspendUser: async (userId: string): Promise<UserData> => {
    const response = await apiClient.put<ApiResponse<UserData>>(
      `/admin/users/${userId}/unsuspend`
    );
    return extractData(response);
  },

  // ============================================
  // ROLE UPGRADE REQUESTS
  // ============================================

  /**
   * Get all role upgrade requests
   * GET /api/admin/role-requests
   * Requires Admin role
   */
  getRoleUpgradeRequests: async (params?: {
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<RoleUpgradeRequestResponse[]> => {
    const response = await apiClient.get<ApiResponse<RoleUpgradeRequestResponse[]>>(
      '/admin/role-requests',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get pending role upgrade requests
   * GET /api/admin/role-requests/pending
   * Requires Admin role
   */
  getPendingRoleRequests: async (): Promise<RoleUpgradeRequestResponse[]> => {
    const response = await apiClient.get<ApiResponse<RoleUpgradeRequestResponse[]>>(
      '/admin/role-requests/pending'
    );
    return extractData(response);
  },

  /**
   * Review role upgrade request
   * PUT /api/admin/role-requests/{requestId}/review
   * Requires Admin role
   */
  reviewRoleRequest: async (data: ReviewRoleUpgradeRequest): Promise<RoleUpgradeRequestResponse> => {
    const response = await apiClient.put<ApiResponse<RoleUpgradeRequestResponse>>(
      `/admin/role-requests/${data.request_id}/review`,
      { status: data.status, notes: data.notes }
    );
    return extractData(response);
  },

  /**
   * Approve role upgrade request
   * PUT /api/admin/role-requests/{requestId}/approve
   * Requires Admin role
   */
  approveRoleRequest: async (requestId: string): Promise<RoleUpgradeRequestResponse> => {
    const response = await apiClient.put<ApiResponse<RoleUpgradeRequestResponse>>(
      `/admin/role-requests/${requestId}/approve`
    );
    return extractData(response);
  },

  /**
   * Reject role upgrade request
   * PUT /api/admin/role-requests/{requestId}/reject
   * Requires Admin role
   */
  rejectRoleRequest: async (requestId: string, notes?: string): Promise<RoleUpgradeRequestResponse> => {
    const response = await apiClient.put<ApiResponse<RoleUpgradeRequestResponse>>(
      `/admin/role-requests/${requestId}/reject`,
      { notes }
    );
    return extractData(response);
  },

  // ============================================
  // STATISTICS & DASHBOARD
  // ============================================

  /**
   * Get admin dashboard statistics
   * GET /api/admin/stats
   * Requires Admin role
   */
  getStats: async (): Promise<AdminStatsResponse> => {
    const response = await apiClient.get<ApiResponse<AdminStatsResponse>>(
      '/admin/stats'
    );
    return extractData(response);
  },

  /**
   * Get business statistics
   * GET /api/admin/stats/businesses
   * Requires Admin role
   */
  getBusinessStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/admin/stats/businesses'
    );
    return extractData(response);
  },

  /**
   * Get order statistics
   * GET /api/admin/stats/orders
   * Requires Admin role
   */
  getOrderStats: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/admin/stats/orders',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get revenue statistics
   * GET /api/admin/stats/revenue
   * Requires Admin role
   */
  getRevenueStats: async (params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/admin/stats/revenue',
      { params }
    );
    return extractData(response);
  },

  // ============================================
  // BUSINESS MANAGEMENT (ADMIN)
  // ============================================

  /**
   * Remove any business
   * DELETE /api/admin/businesses/{businessId}
   * Requires Admin role
   */
  removeBusiness: async (businessId: string): Promise<void> => {
    await apiClient.delete(`/admin/businesses/${businessId}`);
  },

  /**
   * Feature/unfeature business
   * PUT /api/admin/businesses/{businessId}/toggle-featured
   * Requires Admin role
   */
  toggleFeaturedBusiness: async (businessId: string): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/businesses/${businessId}/toggle-featured`
    );
    return extractData(response);
  },
};
