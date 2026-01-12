/**
 * Product Service
 * Handles product operations
 */

import { apiClient, extractData, createFormData } from './api';
import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ApiResponse,
} from '../types/api';

export const productService = {
  /**
   * Get all products
   * GET /api/products
   */
  getAll: async (params?: {
    business_id?: string;
    category?: string;
    search?: string;
  }): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductResponse[]>>(
      '/products',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get product by ID
   * GET /api/products/{id}
   */
  getById: async (id: string): Promise<ProductResponse> => {
    const response = await apiClient.get<ApiResponse<ProductResponse>>(
      `/products/${id}`
    );
    return extractData(response);
  },

  /**
   * Get products by business ID
   * GET /api/products/business/{businessId}
   */
  getByBusinessId: async (businessId: string): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductResponse[]>>(
      `/products/business/${businessId}`
    );
    return extractData(response);
  },

  /**
   * Get products owned by current user
   * GET /api/products/my-products
   */
  getMyProducts: async (): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductResponse[]>>(
      '/products/my-products'
    );
    return extractData(response);
  },

  /**
   * Create new product
   * POST /api/products
   * Requires UMKM or Admin role
   */
  create: async (data: CreateProductRequest): Promise<ProductResponse> => {
    const formData = data.image instanceof File
      ? createFormData(data)
      : data;

    const response = await apiClient.post<ApiResponse<ProductResponse>>(
      '/products',
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
   * Update product
   * PUT /api/products/{id}
   * Requires ownership or Admin role
   */
  update: async (data: UpdateProductRequest): Promise<ProductResponse> => {
    const { id, ...updateData } = data;
    
    const formData = updateData.image instanceof File
      ? createFormData({ ...updateData, _method: 'PUT' })
      : updateData;

    const response = await apiClient.post<ApiResponse<ProductResponse>>(
      `/products/${id}`,
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
   * Delete product
   * DELETE /api/products/{id}
   * Requires ownership or Admin role
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  /**
   * Get featured products
   * GET /api/products/featured
   */
  getFeatured: async (limit?: number): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductResponse[]>>(
      '/products/featured',
      { params: { limit } }
    );
    return extractData(response);
  },
};
