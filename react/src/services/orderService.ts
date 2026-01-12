/**
 * Order Service
 * Handles order and checkout operations
 */

import { apiClient, extractData } from './api';
import {
  CheckoutRequest,
  OrderResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types/api';

export const orderService = {
  /**
   * Create new order (checkout)
   * POST /api/orders/checkout
   */
  checkout: async (data: CheckoutRequest): Promise<OrderResponse> => {
    const response = await apiClient.post<ApiResponse<OrderResponse>>(
      '/orders/checkout',
      data
    );
    return extractData(response);
  },

  /**
   * Get all orders for current user
   * GET /api/orders
   */
  getMyOrders: async (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<OrderResponse[]> => {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      '/orders',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get paginated orders
   * GET /api/orders/paginated
   */
  getMyOrdersPaginated: async (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<OrderResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<OrderResponse>>>(
      '/orders/paginated',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get order by ID
   * GET /api/orders/{id}
   */
  getById: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.get<ApiResponse<OrderResponse>>(
      `/orders/${id}`
    );
    return extractData(response);
  },

  /**
   * Get order by order number
   * GET /api/orders/number/{orderNumber}
   */
  getByOrderNumber: async (orderNumber: string): Promise<OrderResponse> => {
    const response = await apiClient.get<ApiResponse<OrderResponse>>(
      `/orders/number/${orderNumber}`
    );
    return extractData(response);
  },

  /**
   * Update order status
   * PUT /api/orders/{id}/status
   * Requires UMKM (for own orders) or Admin role
   */
  updateStatus: async (
    orderId: string,
    status: 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<OrderResponse> => {
    const response = await apiClient.put<ApiResponse<OrderResponse>>(
      `/orders/${orderId}/status`,
      { status }
    );
    return extractData(response);
  },

  /**
   * Cancel order
   * PUT /api/orders/{id}/cancel
   */
  cancelOrder: async (orderId: string, reason?: string): Promise<OrderResponse> => {
    const response = await apiClient.put<ApiResponse<OrderResponse>>(
      `/orders/${orderId}/cancel`,
      { reason }
    );
    return extractData(response);
  },

  /**
   * Get orders for UMKM's business
   * GET /api/orders/business/{businessId}
   * Requires business ownership or Admin role
   */
  getBusinessOrders: async (businessId: string, params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<OrderResponse[]> => {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `/orders/business/${businessId}`,
      { params }
    );
    return extractData(response);
  },

  /**
   * Confirm payment
   * POST /api/orders/{id}/confirm-payment
   */
  confirmPayment: async (orderId: string, paymentProof?: File): Promise<OrderResponse> => {
    const formData = new FormData();
    if (paymentProof) {
      formData.append('payment_proof', paymentProof);
    }

    const response = await apiClient.post<ApiResponse<OrderResponse>>(
      `/orders/${orderId}/confirm-payment`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return extractData(response);
  },
};
