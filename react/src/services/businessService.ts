/**
 * Business Service
 * Handles UMKM business operations
 */

import { apiClient, extractData, createFormData } from './api';
import {
  CreateBusinessRequest,
  UpdateBusinessRequest,
  BusinessResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types/api';

export const businessService = {
  /**
   * Get all businesses
   * GET /api/businesses
   */
  getAll: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<BusinessResponse[]> => {
    const response = await apiClient.get<ApiResponse<BusinessResponse[]>>(
      '/businesses',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get paginated businesses
   * GET /api/businesses/paginated
   */
  getPaginated: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<BusinessResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<BusinessResponse>>>(
      '/businesses/paginated',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get business by ID
   * GET /api/businesses/{id}
   */
  getById: async (id: string): Promise<BusinessResponse> => {
    const response = await apiClient.get<ApiResponse<BusinessResponse>>(
      `/businesses/${id}`
    );
    return extractData(response);
  },

  /**
   * Get businesses owned by current user
   * GET /api/businesses/my-businesses
   */
  getMyBusinesses: async (): Promise<BusinessResponse[]> => {
    const response = await apiClient.get<ApiResponse<BusinessResponse[]>>(
      '/businesses/my-businesses'
    );
    return extractData(response);
  },

  /**
   * Create new business
   * POST /api/businesses
   * Requires UMKM or Admin role
   */
  create: async (data: CreateBusinessRequest): Promise<BusinessResponse> => {
    const formData = data.image instanceof File 
      ? createFormData(data)
      : data;

    const response = await apiClient.post<ApiResponse<BusinessResponse>>(
      '/businesses',
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
   * Update business
   * PUT /api/businesses/{id}
   * Requires ownership or Admin role
   */
  update: async (data: UpdateBusinessRequest): Promise<BusinessResponse> => {
    const { id, ...updateData } = data;
    
    const formData = updateData.image instanceof File
      ? createFormData({ ...updateData, _method: 'PUT' })
      : updateData;

    const response = await apiClient.post<ApiResponse<BusinessResponse>>(
      `/businesses/${id}`,
      formData,
      {
        headers: updateData.image instanceof File
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined,
      }
    );
    return extractData(response);
  },

  /**
   * Delete business
   * DELETE /api/businesses/{id}
   * Requires ownership or Admin role
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/businesses/${id}`);
  },

  /**
   * Get featured businesses
   * GET /api/businesses/featured
   */
  getFeatured: async (limit?: number): Promise<BusinessResponse[]> => {
    const response = await apiClient.get<ApiResponse<BusinessResponse[]>>(
      '/businesses/featured',
      { params: { limit } }
    );
    return extractData(response);
  },

  /**
   * Get businesses by category
   * GET /api/businesses/category/{category}
   */
  getByCategory: async (category: string): Promise<BusinessResponse[]> => {
    const response = await apiClient.get<ApiResponse<BusinessResponse[]>>(
      `/businesses/category/${category}`
    );
    return extractData(response);
  },
};
