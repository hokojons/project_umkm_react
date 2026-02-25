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
   * Get orders for UMKM's business by ID
   * GET /api/orders/business/{businessId}
   * Requires business ownership or Admin role
   */
  getBusinessOrdersById: async (businessId: string, params?: {
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

  /**
   * Create order (for WhatsApp checkout)
   * POST /api/orders
   */
  createOrder: async (data: {
    business_id: string;
    no_whatsapp_pembeli?: string;
    catatan?: string;
    payment_method?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
      name: string;
    }>;
    total: number;
  }): Promise<OrderResponse> => {
    const response = await apiClient.post<ApiResponse<OrderResponse>>(
      '/orders',
      data
    );
    return extractData(response);
  },

  /**
   * Get user orders
   * GET /api/orders/user/all
   */
  getUserOrders: async (): Promise<OrderResponse[]> => {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      '/orders/user/all'
    );
    return extractData(response);
  },

  /**
   * Customer update order status manually
   * PUT /api/orders/{id}/customer-status
   */
  updateStatusByCustomer: async (
    orderId: string,
    status: 'paid' | 'completed' | 'cancelled',
    catatanPembayaran?: string,
    paymentProof?: File,
    paymentMethod?: string
  ): Promise<OrderResponse> => {
    // Use FormData if there's a file to upload
    if (paymentProof) {
      const formData = new FormData();
      formData.append('status', status);
      if (catatanPembayaran) {
        formData.append('catatan_pembayaran', catatanPembayaran);
      }
      if (paymentMethod) {
        formData.append('payment_method', paymentMethod);
      }
      formData.append('bukti_pembayaran', paymentProof);

      const response = await apiClient.post<ApiResponse<OrderResponse>>(
        `/orders/${orderId}/customer-status`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return extractData(response);
    } else {
      // Regular JSON request
      const data: { status: string; catatan_pembayaran?: string; payment_method?: string } = { status };
      if (catatanPembayaran) {
        data.catatan_pembayaran = catatanPembayaran;
      }
      if (paymentMethod) {
        data.payment_method = paymentMethod;
      }
      const response = await apiClient.put<ApiResponse<OrderResponse>>(
        `/orders/${orderId}/customer-status`,
        data
      );
      return extractData(response);
    }
  },

  /**
   * Get WhatsApp link for order
   * GET /api/orders/{id}/whatsapp-link
   */
  getWhatsAppLink: async (orderId: string): Promise<{ whatsapp_link: string; message: string }> => {
    const response = await apiClient.get<ApiResponse<{ whatsapp_link: string; message: string }>>(
      `/orders/${orderId}/whatsapp-link`
    );
    return extractData(response);
  },

  /**
   * Get orders for UMKM (business owner)
   * GET /api/orders/business/all
   */
  getBusinessOrders: async (): Promise<OrderResponse[]> => {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      '/orders/business/all'
    );
    return extractData(response);
  },

  /**
   * UMKM update order status
   * PUT /api/orders/{id}/status
   * Note: UMKM can set to processing, shipped, completed, or cancelled.
   */
  updateStatusByUmkm: async (
    orderId: string,
    status: 'processing' | 'shipped' | 'completed' | 'cancelled',
    lokasiPengambilan?: string
  ): Promise<OrderResponse> => {
    const data: { status: string; lokasi_pengambilan?: string } = { status };
    if (lokasiPengambilan) {
      data.lokasi_pengambilan = lokasiPengambilan;
    }
    const response = await apiClient.put<ApiResponse<OrderResponse>>(
      `/orders/${orderId}/status`,
      data
    );
    return extractData(response);
  },
};
