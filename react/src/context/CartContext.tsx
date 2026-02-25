import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "../types";
import { toast } from "sonner";
import { cartService } from "../services/cartService";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Product, businessName: string, businessId: string, businessWhatsapp?: string, bankInfo?: { namaBank?: string; noRekening?: string; atasNama?: string }, menyediakanJasaKirim?: boolean) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncCartWithUser: (userId: string | null) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to get cart key for specific user (localStorage fallback)
const getCartKey = (userId: string | null) => {
  return userId ? `pasar_umkm_cart_${userId}` : null;
};

// Helper to load cart from localStorage (fallback)
const loadCartFromStorage = (userId: string | null): CartItem[] => {
  const key = getCartKey(userId);
  if (!key) return [];

  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Helper to save cart to localStorage (backup)
const saveCartToStorage = (userId: string | null, items: CartItem[]) => {
  const key = getCartKey(userId);
  if (!key) return;

  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from backend when user changes
  const loadCartFromBackend = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await cartService.getCart(userId);
      if (response.success && response.data) {
        // Transform backend data to CartItem format
        // Use cart entry id as unique key, store product_id for backend sync
        const backendItems: CartItem[] = response.data.map((item: any, index: number) => ({
          id: item.id ? `cart_${item.id}` : `${item.product_id}_${index}`,
          originalProductId: String(item.product_id),
          name: item.product_name || item.product?.nama_produk,
          price: parseFloat(item.product_price || item.product?.harga),
          quantity: item.quantity || item.jumlah,
          image: item.product?.gambar || "",
          description: item.product?.deskripsi || "",
          category: item.product?.kategori || "",
          businessName: item.business?.name || item.product?.umkm?.nama_toko || "",
          businessId: String(item.business?.id || item.product?.umkm_id || ""),
          businessWhatsapp: item.business?.phone || item.product?.umkm?.whatsapp || "",
          // Include delivery option and bank info from UMKM
          menyediakanJasaKirim: item.product?.umkm?.menyediakan_jasa_kirim ?? false,
          namaBank: item.product?.umkm?.nama_bank || "",
          noRekening: item.product?.umkm?.no_rekening || "",
          atasNama: item.product?.umkm?.atas_nama_rekening || item.product?.umkm?.atas_nama || "",
        }));
        setCartItems(backendItems);
        // Also save to localStorage as backup
        saveCartToStorage(userId, backendItems);
      } else {
        // Fallback to localStorage if backend fails
        const localCart = loadCartFromStorage(userId);
        setCartItems(localCart);
      }
    } catch (error) {
      console.error("Error loading cart from backend:", error);
      // Fallback to localStorage
      const localCart = loadCartFromStorage(userId);
      setCartItems(localCart);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart when component mounts
  useEffect(() => {
    const savedUser = localStorage.getItem("pasar_umkm_current_user");
    const userId = savedUser ? JSON.parse(savedUser).id : null;

    if (userId !== currentUserId) {
      setCurrentUserId(userId);
      if (userId) {
        loadCartFromBackend(userId);
      } else {
        setCartItems([]);
      }
    }
  }, [currentUserId]);

  // Listen for user-changed custom event
  useEffect(() => {
    const handleUserChanged = (event: CustomEvent) => {
      const userId = event.detail?.userId;
      setCurrentUserId(userId);
      if (userId) {
        loadCartFromBackend(userId);
      } else {
        setCartItems([]);
      }
    };

    window.addEventListener("user-changed", handleUserChanged as EventListener);
    return () => {
      window.removeEventListener("user-changed", handleUserChanged as EventListener);
    };
  }, []);

  // Listen for storage changes (login/logout in other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem("pasar_umkm_current_user");
      const userId = savedUser ? JSON.parse(savedUser).id : null;

      if (userId !== currentUserId) {
        setCurrentUserId(userId);
        if (userId) {
          loadCartFromBackend(userId);
        } else {
          setCartItems([]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [currentUserId]);

  // Save to localStorage as backup whenever cart changes
  useEffect(() => {
    if (currentUserId) {
      saveCartToStorage(currentUserId, cartItems);
    }
  }, [cartItems, currentUserId]);

  // Function to sync cart with user (called on login/logout)
  const syncCartWithUser = (userId: string | null) => {
    setCurrentUserId(userId);
    if (userId) {
      loadCartFromBackend(userId);
    } else {
      setCartItems([]);
    }
  };

  const addToCart = async (
    item: Product,
    businessName: string,
    businessId: string,
    businessWhatsapp?: string,
    bankInfo?: { namaBank?: string; noRekening?: string; atasNama?: string },
    menyediakanJasaKirim?: boolean
  ) => {
    if (!currentUserId) {
      window.dispatchEvent(new CustomEvent("open-login-modal"));
      toast.info("Silakan login untuk menambahkan ke keranjang");
      return;
    }

    // Check stock
    const maxStock = item.stock ?? Infinity;
    if (!item.available || (item.stock !== undefined && item.stock <= 0)) {
      toast.error(`Maaf, ${item.name} sedang habis stok`);
      return;
    }

    // Generate variant-aware cart key
    const selectedVariants = (item as any).selectedVariants as Record<string, { optionId: number; value: string; priceAdjustment: number }> | undefined;
    const variantKey = selectedVariants
      ? Object.values(selectedVariants).map(v => v.optionId).sort().join("-")
      : "";
    const cartItemId = variantKey ? `${item.id}_v${variantKey}` : item.id;

    // Calculate adjusted price
    let adjustedPrice = item.price;
    if (selectedVariants) {
      Object.values(selectedVariants).forEach(v => {
        adjustedPrice += v.priceAdjustment;
      });
    }

    // Find existing item - check both direct ID match and originalProductId match
    const existingItem = cartItems.find((cartItem) =>
      cartItem.id === cartItemId || cartItem.originalProductId === String(item.id)
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > maxStock) {
        toast.error(`Stok ${item.name} hanya tersedia ${maxStock} item`);
        return;
      }
    }

    // Sync with backend (use original product id)
    const response = await cartService.addToCart(currentUserId, item.id, 1);

    if (response.success) {
      // Reload cart from backend to ensure sync (backend uses updateOrCreate to consolidate)
      await loadCartFromBackend(currentUserId);
      if (existingItem) {
        toast.success(`Jumlah ${item.name} ditambahkan!`);
      } else {
        toast.success(`${item.name} ditambahkan ke keranjang!`);
      }
    } else {
      toast.error(response.message || "Gagal menambahkan ke keranjang");
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!currentUserId) return;

    // Get the original product ID for backend sync
    const item = cartItems.find((i) => i.id === itemId);
    const backendProductId = item?.originalProductId || itemId;

    // Sync with backend
    const response = await cartService.removeFromCart(currentUserId, backendProductId);

    if (response.success) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("Item dihapus dari keranjang");
    } else {
      toast.error(response.message || "Gagal menghapus dari keranjang");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!currentUserId) return;

    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      const maxStock = item.stock ?? Infinity;
      if (quantity > maxStock) {
        toast.error(`Stok ${item.name} hanya tersedia ${maxStock} item`);
        return;
      }
    }

    // Get the original product ID for backend sync
    const backendProductId = item?.originalProductId || itemId;

    // Sync with backend
    const response = await cartService.updateQuantity(currentUserId, backendProductId, quantity);

    if (response.success) {
      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    } else {
      toast.error(response.message || "Gagal mengupdate keranjang");
    }
  };

  const clearCart = async () => {
    if (!currentUserId) return;

    // Sync with backend
    const response = await cartService.clearCart(currentUserId);

    if (response.success) {
      setCartItems([]);
      toast.success("Keranjang dikosongkan");
    } else {
      toast.error(response.message || "Gagal mengosongkan keranjang");
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        syncCartWithUser,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
