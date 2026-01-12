/**
 * Tracking Service
 * Handles order tracking operations
 */

import { apiClient, extractData } from './api';
import {
  TrackingData,
  UpdateTrackingRequest,
  ApiResponse,
} from '../types/api';

export const trackingService = {
  /**
   * Get tracking data by order ID
   * GET /api/tracking/order/{orderId}
   */
  getByOrderId: async (orderId: string): Promise<TrackingData> => {
    const response = await apiClient.get<ApiResponse<TrackingData>>(
      `/tracking/order/${orderId}`
    );
    return extractData(response);
  },

  /**
   * Get tracking data by order number
   * GET /api/tracking/{orderNumber}
   */
  getByOrderNumber: async (orderNumber: string): Promise<TrackingData> => {
    const response = await apiClient.get<ApiResponse<TrackingData>>(
      `/tracking/${orderNumber}`
    );
    return extractData(response);
  },

  /**
   * Update tracking status
   * PUT /api/tracking/update
   * Requires UMKM (for own orders) or Admin role
   */
  updateTracking: async (data: UpdateTrackingRequest): Promise<TrackingData> => {
    const response = await apiClient.put<ApiResponse<TrackingData>>(
      '/tracking/update',
      data
    );
    return extractData(response);
  },

  /**
   * Mark step as completed
   * POST /api/tracking/complete-step
   * Requires UMKM (for own orders) or Admin role
   */
  completeStep: async (orderId: string, step: number): Promise<TrackingData> => {
    const response = await apiClient.post<ApiResponse<TrackingData>>(
      '/tracking/complete-step',
      { order_id: orderId, step }
    );
    return extractData(response);
  },

  /**
   * Skip to specific step (demo mode)
   * POST /api/tracking/skip-step
   * For demo purposes only
   */
  skipToStep: async (orderId: string, step: number): Promise<TrackingData> => {
    const response = await apiClient.post<ApiResponse<TrackingData>>(
      '/tracking/skip-step',
      { order_id: orderId, step }
    );
    return extractData(response);
  },
};
