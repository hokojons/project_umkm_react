/**
 * Role Upgrade Service
 * Handles user role upgrade requests (User -> UMKM)
 */

import { apiClient, extractData } from './api';
import {
  RoleUpgradeRequestResponse,
  ApiResponse,
} from '../types/api';

export const roleUpgradeService = {
  /**
   * Submit role upgrade request
   * POST /api/role-upgrade/request
   * Requires User role
   */
  submitRequest: async (reason?: string): Promise<RoleUpgradeRequestResponse> => {
    const response = await apiClient.post<ApiResponse<RoleUpgradeRequestResponse>>(
      '/role-upgrade/request',
      { reason }
    );
    return extractData(response);
  },

  /**
   * Get my role upgrade requests
   * GET /api/role-upgrade/my-requests
   */
  getMyRequests: async (): Promise<RoleUpgradeRequestResponse[]> => {
    const response = await apiClient.get<ApiResponse<RoleUpgradeRequestResponse[]>>(
      '/role-upgrade/my-requests'
    );
    return extractData(response);
  },

  /**
   * Get latest role upgrade request
   * GET /api/role-upgrade/latest
   */
  getLatestRequest: async (): Promise<RoleUpgradeRequestResponse | null> => {
    try {
      const response = await apiClient.get<ApiResponse<RoleUpgradeRequestResponse>>(
        '/role-upgrade/latest'
      );
      return extractData(response);
    } catch (error) {
      return null;
    }
  },

  /**
   * Cancel role upgrade request
   * DELETE /api/role-upgrade/request/{requestId}
   */
  cancelRequest: async (requestId: string): Promise<void> => {
    await apiClient.delete(`/role-upgrade/request/${requestId}`);
  },

  /**
   * Check if user can request upgrade
   * GET /api/role-upgrade/can-request
   */
  canRequest: async (): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<{ can_request: boolean }>>(
      '/role-upgrade/can-request'
    );
    const data = extractData(response);
    return data.can_request;
  },
};
