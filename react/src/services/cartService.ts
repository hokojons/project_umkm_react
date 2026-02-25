/**
 * Cart Service - Backend Sync
 * Handles shopping cart operations with database backend
 */

import { API_BASE_URL as API_BASE } from '../config/api';

export const cartService = {
  /**
   * Get user's cart items
   * GET /api/cart/{userId}
   */
  getCart: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE}/cart/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Add item to cart
   * POST /api/cart
   */
  addToCart: async (userId: string, productId: string, quantity: number = 1) => {
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
          quantity: quantity,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add to cart' };
    }
  },

  /**
   * Update cart item quantity
   * PUT /api/cart/{userId}/{productId}
   */
  updateQuantity: async (userId: string, productId: string, quantity: number) => {
    try {
      const response = await fetch(`${API_BASE}/cart/${userId}/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false, message: 'Failed to update cart' };
    }
  },

  /**
   * Remove item from cart
   * DELETE /api/cart/{userId}/{productId}
   */
  removeFromCart: async (userId: string, productId: string) => {
    try {
      const response = await fetch(`${API_BASE}/cart/${userId}/${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'Failed to remove from cart' };
    }
  },

  /**
   * Clear entire cart
   * DELETE /api/cart/{userId}/clear
   */
  clearCart: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE}/cart/${userId}/clear`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: 'Failed to clear cart' };
    }
  },
};
