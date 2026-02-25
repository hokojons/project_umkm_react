export interface VariantOption {
  id: number;
  variant_type_id: number;
  value: string;
  image?: string | null;
  price_adjustment: number;
  stock?: number | null;
  display_order: number;
}

export interface VariantType {
  id: number;
  product_id: number;
  name: string;
  display_order: number;
  options: VariantOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  all_images?: string[];
  category: "product" | "food" | "accessory" | "craft" | string;
  businessId?: string;
  ownerId?: string; // For UMKM owners to manage their products
  stock?: number; // Available stock quantity
  available?: boolean; // Whether the product is available
  variant_types?: VariantType[]; // Product variants (Tokopedia/Shopee style)
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
  menyediakanJasaKirim?: boolean; // Whether the UMKM provides delivery service
  // Contact information
  whatsapp?: string; // WhatsApp number (format: 628xxx)
  phone?: string; // Phone number
  email?: string; // Email address
  instagram?: string; // Instagram handle (without @)
  // Bank account info
  namaBank?: string;
  noRekening?: string;
  atasNama?: string;
}

export interface CartItem extends Product {
  quantity: number;
  businessName: string;
  businessId: string;
  businessWhatsapp?: string; // WhatsApp number of the UMKM
  menyediakanJasaKirim?: boolean; // Whether the UMKM provides delivery service
  // Bank account info
  namaBank?: string;
  noRekening?: string;
  atasNama?: string;
  // Variant selection
  selectedVariants?: Record<string, { optionId: number; value: string; priceAdjustment: number }>;
  // Original product ID for backend sync (id field may be cart_entry_id)
  originalProductId?: string;
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
