import {
  X,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../context/CartContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { CheckoutModal } from "./CheckoutModal";
import { toast } from "sonner";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userPhoneNumber?: string;
}

interface CartItem {
  id: string;
  product_id: string;
  jumlah: number;
  product?: {
    id: string;
    nama: string;
    harga: number;
    image?: string;
    user_id?: string; // UMKM ID
  };
}

interface GroupedByUMKM {
  [umkmId: string]: {
    umkmName: string;
    items: CartItem[];
    total: number;
  };
}

export function CartSidebarGrouped({
  isOpen,
  onClose,
  userPhoneNumber,
}: CartSidebarProps) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedUMKMId, setSelectedUMKMId] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Group items by UMKM
  const groupedByUMKM: GroupedByUMKM = cartItems.reduce((acc, item) => {
    const umkmId = item.product?.user_id || "unknown";
    const umkmName = item.product?.user_id?.includes("umkm")
      ? "UMKM " + umkmId.slice(-4)
      : "UMKM";

    if (!acc[umkmId]) {
      acc[umkmId] = {
        umkmName,
        items: [],
        total: 0,
      };
    }

    acc[umkmId].items.push(item);
    acc[umkmId].total += (item.product?.harga || 0) * item.jumlah;

    return acc;
  }, {} as GroupedByUMKM);

  const umkmList = Object.entries(groupedByUMKM);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="size-5 text-indigo-600" />
                  <h3>Keranjang Belanja</h3>
                  {getTotalItems() > 0 && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Cart Items Grouped by UMKM */}
              <div className="flex-1 overflow-y-auto p-4">
                {umkmList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="size-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-2">Keranjang Anda kosong</p>
                    <p className="text-gray-400 text-sm">
                      Mulai belanja dari UMKM favorit!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {umkmList.map(([umkmId, umkmData]) => (
                      <div
                        key={umkmId}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* UMKM Header */}
                        <button
                          onClick={() =>
                            setSelectedUMKMId(
                              selectedUMKMId === umkmId ? null : umkmId
                            )
                          }
                          className="w-full bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 flex items-center justify-between hover:from-indigo-100 hover:to-indigo-150 transition"
                        >
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">
                              {umkmData.umkmName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {umkmData.items.length} item(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-indigo-600">
                              {formatPrice(umkmData.total)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {selectedUMKMId === umkmId ? "▼" : "▶"}
                            </p>
                          </div>
                        </button>

                        {/* UMKM Items (Expanded) */}
                        <AnimatePresence>
                          {selectedUMKMId === umkmId && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-200 bg-gray-50 divide-y divide-gray-200"
                            >
                              {umkmData.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-3 hover:bg-gray-100 transition"
                                >
                                  <div className="flex gap-3">
                                    {/* Product Image */}
                                    {item.product?.image && (
                                      <ImageWithFallback
                                        src={item.product.image}
                                        alt={item.product.nama}
                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                      />
                                    )}

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-gray-900 truncate">
                                        {item.product?.nama}
                                      </p>
                                      <p className="text-sm text-indigo-600 font-semibold mt-1">
                                        {formatPrice(item.product?.harga || 0)}
                                      </p>

                                      {/* Quantity Controls */}
                                      <div className="flex items-center gap-2 mt-2">
                                        <button
                                          onClick={() =>
                                            updateQuantity(
                                              item.id,
                                              item.jumlah - 1
                                            )
                                          }
                                          className="p-1 hover:bg-white dark:hover:bg-gray-500 rounded transition text-gray-900 dark:text-white"
                                        >
                                          <Minus className="size-4 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <span className="w-8 text-center font-semibold text-sm">
                                          {item.jumlah}
                                        </span>
                                        <button
                                          onClick={() =>
                                            updateQuantity(
                                              item.id,
                                              item.jumlah + 1
                                            )
                                          }
                                          className="p-1 hover:bg-white dark:hover:bg-gray-500 rounded transition text-gray-900 dark:text-white"
                                        >
                                          <Plus className="size-4 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            removeFromCart(item.id)
                                          }
                                          className="ml-auto p-1 hover:bg-red-100 rounded transition"
                                        >
                                          <Trash2 className="size-4 text-red-600" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Checkout Button Per UMKM */}
                              <div className="p-3 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={() => {
                                    setShowCheckout(true);
                                    setSelectedUMKMId(umkmId);
                                  }}
                                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition"
                                >
                                  <MessageCircle size={18} />
                                  Checkout dari {umkmData.umkmName}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Summary */}
              {umkmList.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Total Belanja:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Klik UMKM untuk melihat detail dan checkout
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => {
            setShowCheckout(false);
            setSelectedUMKMId(null);
          }}
          selectedUMKMId={selectedUMKMId || undefined}
        />
      )}
    </>
  );
}
