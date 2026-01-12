/**
 * Cart Service
 * Handles shopping cart operations
 */

import { apiClient, extractData } from './api';
import {
  AddToCartRequest,
  UpdateCartItemRequest,
  CartResponse,
  ApiResponse,
} from '../types/api';

export const cartService = {
  /**
   * Get current user's cart
   * GET /api/cart
   */
  getCart: async (): Promise<CartResponse> => {
    const response = await apiClient.get<ApiResponse<CartResponse>>('/cart');
    return extractData(response);
  },

  /**
   * Add item to cart
   * POST /api/cart/add
   */
  addToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await apiClient.post<ApiResponse<CartResponse>>(
      '/cart/add',
      data
    );
    return extractData(response);
  },

  /**
   * Update cart item quantity
   * PUT /api/cart/update
   */
  updateCartItem: async (data: UpdateCartItemRequest): Promise<CartResponse> => {
    const response = await apiClient.put<ApiResponse<CartResponse>>(
      '/cart/update',
      data
    );
    return extractData(response);
  },

  /**
   * Remove item from cart
   * DELETE /api/cart/remove/{cartItemId}
   */
  removeFromCart: async (cartItemId: string): Promise<CartResponse> => {
    const response = await apiClient.delete<ApiResponse<CartResponse>>(
      `/cart/remove/${cartItemId}`
    );
    return extractData(response);
  },

  /**
   * Clear entire cart
   * DELETE /api/cart/clear
   */
  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart/clear');
  },

  /**
   * Sync local cart with server (for guest to authenticated user)
   * POST /api/cart/sync
   */
  syncCart: async (localCartItems: AddToCartRequest[]): Promise<CartResponse> => {
    const response = await apiClient.post<ApiResponse<CartResponse>>(
      '/cart/sync',
      { items: localCartItems }
    );
    return extractData(response);
  },
};
