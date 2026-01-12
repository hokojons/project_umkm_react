export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: "product" | "food" | "accessory" | "craft";
  businessId?: string;
  ownerId?: string; // For UMKM owners to manage their products
}

export interface UMKMBusiness {
  id: string;
  name: string;
  owner: string;
  description: string;
  about?: string; // About Me section for UMKM
  image: string;
  products: Product[];
  menu?: Product[]; // Alias for products
  category: string;
  rating?: number; // Rating 1-5
  isActive?: boolean; // Whether the UMKM is active
  ownerId?: string; // For UMKM owners to manage their business
  // Contact information
  whatsapp?: string; // WhatsApp number (format: 628xxx)
  phone?: string; // Phone number
  email?: string; // Email address
  instagram?: string; // Instagram handle (without @)
}

export interface CartItem extends Product {
  quantity: number;
  businessName: string;
  businessId: string;
}

// Legacy aliases for backward compatibility
export type MenuItem = Product;
export type FoodStand = UMKMBusiness;

// Role upgrade request
export interface RoleUpgradeRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedRole: "umkm";
  currentRole: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// User role type
export type UserRole = "user" | "umkm" | "admin";
