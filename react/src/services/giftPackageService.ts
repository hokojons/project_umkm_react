/**
 * Gift Package Service
 * Handles special gift package operations
 */

import { apiClient, extractData, createFormData } from './api';
import {
  GiftPackageRequest,
  GiftPackageResponse,
  ApiResponse,
} from '../types/api';

export const giftPackageService = {
  /**
   * Get all gift packages
   * GET /api/gift-packages
   */
  getAll: async (params?: {
    is_active?: boolean;
  }): Promise<GiftPackageResponse[]> => {
    const response = await apiClient.get<ApiResponse<GiftPackageResponse[]>>(
      '/gift-packages',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get active gift packages only
   * GET /api/gift-packages/active
   */
  getActive: async (): Promise<GiftPackageResponse[]> => {
    const response = await apiClient.get<ApiResponse<GiftPackageResponse[]>>(
      '/gift-packages/active'
    );
    return extractData(response);
  },

  /**
   * Get gift package by ID
   * GET /api/gift-packages/{id}
   */
  getById: async (id: string): Promise<GiftPackageResponse> => {
    const response = await apiClient.get<ApiResponse<GiftPackageResponse>>(
      `/gift-packages/${id}`
    );
    return extractData(response);
  },

  /**
   * Create new gift package
   * POST /api/gift-packages
   * Requires Admin role
   */
  create: async (data: GiftPackageRequest): Promise<GiftPackageResponse> => {
    const formData = data.image instanceof File
      ? createFormData(data)
      : data;

    const response = await apiClient.post<ApiResponse<GiftPackageResponse>>(
      '/gift-packages',
      formData,
      {
        headers: data.image instanceof File
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined,
      }
    );
    return extractData(response);
  },

  /**
   * Update gift package
   * PUT /api/gift-packages/{id}
   * Requires Admin role
   */
  update: async (id: string, data: Partial<GiftPackageRequest>): Promise<GiftPackageResponse> => {
    const formData = data.image instanceof File
      ? createFormData({ ...data, _method: 'PUT' })
      : data;

    const response = await apiClient.post<ApiResponse<GiftPackageResponse>>(
      `/gift-packages/${id}`,
      formData,
      {
        headers: data.image instanceof File
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined,
      }
    );
    return extractData(response);
  },

  /**
   * Delete gift package
   * DELETE /api/gift-packages/{id}
   * Requires Admin role
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/gift-packages/${id}`);
  },

  /**
   * Toggle gift package active status
   * PUT /api/gift-packages/{id}/toggle-active
   * Requires Admin role
   */
  toggleActive: async (id: string): Promise<GiftPackageResponse> => {
    const response = await apiClient.put<ApiResponse<GiftPackageResponse>>(
      `/gift-packages/${id}/toggle-active`
    );
    return extractData(response);
  },

  /**
   * Add gift package to cart
   * POST /api/gift-packages/{id}/add-to-cart
   */
  addToCart: async (id: string, quantity: number = 1): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/gift-packages/${id}/add-to-cart`,
      { quantity }
    );
    return extractData(response);
  },
};
