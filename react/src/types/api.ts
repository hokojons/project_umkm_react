/**
 * API Types - Request & Response Interfaces
 * These types match the expected Laravel API structure
 */

import { Product, UMKMBusiness, CartItem, RoleUpgradeRequest, UserRole } from './index';

// ============================================
// COMMON TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ============================================
// AUTHENTICATION
// ============================================

export interface LoginRequest {
  email?: string;
  no_telepon?: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: UserData;
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface UserData {
  id: string;
  nama_lengkap?: string;
  name?: string; // Legacy support
  email?: string;
  no_telepon?: string;
  role: UserRole;
  status?: string;
  wa_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// BUSINESSES
// ============================================

export interface CreateBusinessRequest {
  name: string;
  description: string;
  about?: string;
  image?: File | string;
  category: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  instagram?: string;
}

export interface UpdateBusinessRequest extends Partial<CreateBusinessRequest> {
  id: string;
}

export interface BusinessResponse extends UMKMBusiness {}

// ============================================
// PRODUCTS
// ============================================

export interface CreateProductRequest {
  business_id: string;
  name: string;
  description: string;
  price: number;
  image?: File | string;
  category: 'product' | 'food' | 'accessory' | 'craft';
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface ProductResponse extends Product {}

// ============================================
// CART
// ============================================

export interface AddToCartRequest {
  product_id: string;
  business_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cart_item_id: string;
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

// ============================================
// ORDERS
// ============================================

export interface CheckoutRequest {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: 'cod' | 'transfer' | 'e-wallet';
  notes?: string;
  items: {
    product_id: string;
    business_id: string;
    quantity: number;
    price: number;
  }[];
}

export interface OrderResponse {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  items: OrderItem[];
  tracking?: TrackingData;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  business_id: string;
  business_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// ============================================
// TRACKING
// ============================================

export interface TrackingData {
  order_id: string;
  current_step: number;
  steps: TrackingStep[];
  estimated_delivery?: string;
}

export interface TrackingStep {
  step: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
}

export interface UpdateTrackingRequest {
  order_id: string;
  current_step: number;
  step_data?: {
    step: number;
    timestamp: string;
  };
}

// ============================================
// GIFT PACKAGES
// ============================================

export interface GiftPackageRequest {
  name: string;
  description: string;
  price: number;
  image?: File | string;
  items: {
    product_id: string;
    quantity: number;
  }[];
  is_active?: boolean;
}

export interface GiftPackageResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  items: {
    product: ProductResponse;
    quantity: number;
  }[];
  is_active: boolean;
  created_at: string;
}

// ============================================
// EVENTS
// ============================================

export interface EventRequest {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  image?: File | string;
  max_participants?: number;
  requirements?: string;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  image?: string;
  max_participants?: number;
  current_participants: number;
  requirements?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface EventApplicationRequest {
  event_id: string;
  business_id: string;
  message?: string;
}

export interface EventApplicationResponse {
  id: string;
  event_id: string;
  business_id: string;
  business_name: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  created_at: string;
}

// ============================================
// ADMIN
// ============================================

export interface UpdateUserRoleRequest {
  user_id: string;
  role: UserRole;
}

export interface RoleUpgradeRequestResponse extends RoleUpgradeRequest {}

export interface ReviewRoleUpgradeRequest {
  request_id: string;
  status: 'approved' | 'rejected';
  notes?: string;
}

export interface AdminStatsResponse {
  total_users: number;
  total_businesses: number;
  total_orders: number;
  total_revenue: number;
  pending_role_requests: number;
  recent_orders: OrderResponse[];
}
