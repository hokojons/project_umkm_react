import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../context/CartContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { CheckoutModal } from "./CheckoutModal";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

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
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="size-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-gray-900 dark:text-white">
                    Keranjang Belanja
                  </h3>
                  {getTotalItems() > 0 && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-900 dark:text-gray-100"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="size-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Keranjang Anda kosong
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      Mulai belanja sekarang!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3">
                          {/* Image */}
                          {item.image && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm mb-1 truncate text-gray-900 dark:text-white">
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {item.businessName}
                            </p>
                            <div className="text-indigo-600 dark:text-indigo-400 text-sm mb-2">
                              {formatPrice(item.price)}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-600 rounded-lg p-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="p-1 hover:bg-white dark:hover:bg-gray-500 rounded transition-colors text-gray-900 dark:text-gray-100"
                                >
                                  <Minus className="size-3" />
                                </button>
                                <span className="text-sm w-6 text-center text-gray-900 dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="p-1 hover:bg-white dark:hover:bg-gray-500 rounded transition-colors text-gray-900 dark:text-gray-100"
                                >
                                  <Plus className="size-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <Trash2 className="size-4 text-red-500 dark:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-600 flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Subtotal
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Total Item</span>
                      <span>{getTotalItems()} item</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-white">
                        Total Harga
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none font-medium"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="size-5" />
                  </button>
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
          onClose={() => setShowCheckout(false)}
          onCartClose={onClose}
        />
      )}
    </>
  );
}
