import {
  X,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  Store,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../context/CartContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { WhatsAppCheckoutModal } from "./WhatsAppCheckoutModal";
import { toast } from "sonner";
import { CartItem } from "../types";
import { useAuth } from "../context/AuthContext";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GroupedByUMKM {
  [umkmId: string]: {
    umkmName: string;
    umkmWhatsapp: string;
    umkmLocation?: string;
    items: CartItem[];
    total: number;
    // Bank account info
    namaBank?: string;
    noRekening?: string;
    atasNama?: string;
    // Delivery option
    menyediakanJasaKirim?: boolean;
  };
}

export function CartSidebarGrouped({
  isOpen,
  onClose,
}: CartSidebarProps) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  // Default: all UMKM groups are expanded
  const [collapsedUMKM, setCollapsedUMKM] = useState<Set<string>>(new Set());
  const [selectedUMKMId, setSelectedUMKMId] = useState<string | null>(null);
  // Track which items are selected for checkout (item id -> boolean)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showWhatsAppCheckout, setShowWhatsAppCheckout] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Group items by UMKM
  const groupedByUMKM: GroupedByUMKM = cartItems.reduce((acc, item) => {
    const umkmId = item.businessId || "unknown";
    const umkmName = item.businessName || "UMKM";
    // Get WhatsApp from item if available, otherwise use default
    const umkmWhatsapp = (item as CartItem & { businessWhatsapp?: string }).businessWhatsapp || "081234567890";

    if (!acc[umkmId]) {
      acc[umkmId] = {
        umkmName,
        umkmWhatsapp,
        umkmLocation: (item as CartItem & { businessLocation?: string }).businessLocation || "Pasar UMKM Digital",
        items: [],
        total: 0,
        // Bank account info from cart item
        namaBank: item.namaBank,
        noRekening: item.noRekening,
        atasNama: item.atasNama,
        // Delivery option from cart item
        menyediakanJasaKirim: item.menyediakanJasaKirim,
      };
    }

    acc[umkmId].items.push(item);
    acc[umkmId].total += (item.price || 0) * item.quantity;

    return acc;
  }, {} as GroupedByUMKM);

  const umkmList = Object.entries(groupedByUMKM);

  const handleToggleExpand = (umkmId: string) => {
    // Toggle collapse state (default is expanded)
    setCollapsedUMKM(prev => {
      const newSet = new Set(prev);
      if (newSet.has(umkmId)) {
        newSet.delete(umkmId);
      } else {
        newSet.add(umkmId);
      }
      return newSet;
    });
  };

  const handleToggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAllItems = (umkmId: string, items: CartItem[]) => {
    const itemIds = items.map(item => item.id);
    const allSelected = itemIds.every(id => selectedItems.has(id));

    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all
        itemIds.forEach(id => newSet.delete(id));
      } else {
        // Select all
        itemIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleToggleSelect = (umkmId: string) => {
    // Select all items in this UMKM when UMKM checkbox is clicked
    const umkmItems = groupedByUMKM[umkmId]?.items || [];
    const itemIds = umkmItems.map(item => item.id);
    const allSelected = itemIds.every(id => selectedItems.has(id));

    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all items from this UMKM
        itemIds.forEach(id => newSet.delete(id));
      } else {
        // Select all items from this UMKM
        itemIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  // Get items grouped by UMKM for checkout
  const getSelectedItemsByUMKM = () => {
    const result: { [umkmId: string]: { umkmName: string; umkmWhatsapp: string; umkmLocation?: string; items: CartItem[]; total: number; namaBank?: string; noRekening?: string; atasNama?: string; menyediakanJasaKirim?: boolean } } = {};

    cartItems.forEach(item => {
      if (selectedItems.has(item.id)) {
        const umkmId = item.businessId || "unknown";
        if (!result[umkmId]) {
          const umkmData = groupedByUMKM[umkmId];
          result[umkmId] = {
            umkmName: umkmData?.umkmName || "UMKM",
            umkmWhatsapp: umkmData?.umkmWhatsapp || "",
            umkmLocation: umkmData?.umkmLocation,
            items: [],
            total: 0,
            namaBank: umkmData?.namaBank,
            noRekening: umkmData?.noRekening,
            atasNama: umkmData?.atasNama,
            menyediakanJasaKirim: umkmData?.menyediakanJasaKirim,
          };
        }
        result[umkmId].items.push(item);
        result[umkmId].total += (item.price || 0) * item.quantity;
      }
    });

    return result;
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      toast.error("Centang item yang ingin di-checkout terlebih dahulu");
      return;
    }

    const selectedByUMKM = getSelectedItemsByUMKM();
    const umkmIds = Object.keys(selectedByUMKM);

    if (umkmIds.length > 1) {
      toast.error("Pilih item dari satu toko saja untuk checkout. Checkout per toko terpisah.");
      return;
    }

    // Set the UMKM to checkout
    setSelectedUMKMId(umkmIds[0]);
    setShowWhatsAppCheckout(true);
  };

  const handleCheckoutComplete = () => {
    // Remove only the selected items from cart
    selectedItems.forEach((itemId) => {
      removeFromCart(itemId);
    });
    setSelectedItems(new Set());
    setSelectedUMKMId(null);
    toast.success("Pesanan dikirim ke WhatsApp! Silakan lanjutkan chat dengan penjual.");
  };

  // Get selectedUMKMData from selected items
  const selectedUMKMData = (() => {
    const selectedByUMKM = getSelectedItemsByUMKM();
    const umkmIds = Object.keys(selectedByUMKM);

    if (umkmIds.length === 0) return null;
    if (umkmIds.length > 1) return null; // Multiple UMKMs selected

    return selectedByUMKM[umkmIds[0]];
  })();

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
              className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex items-center gap-2 text-white">
                  <ShoppingCart className="size-5" />
                  <h3 className="font-semibold">Keranjang Belanja</h3>
                  {getTotalItems() > 0 && (
                    <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Info Banner */}
              {umkmList.length > 0 && (
                <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    💡 <strong>Tip:</strong> Pilih 1 UMKM untuk checkout. Pesanan akan dikirim langsung via WhatsApp.
                  </p>
                </div>
              )}

              {/* Cart Items Grouped by UMKM */}
              <div className="flex-1 overflow-y-auto p-4">
                {umkmList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="size-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Keranjang Anda kosong</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      Mulai belanja dari UMKM favorit!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {umkmList.map(([umkmId, umkmData]) => {
                      // Default expanded, collapsed if in collapsedUMKM set
                      const isExpanded = !collapsedUMKM.has(umkmId);
                      const isSelected = selectedUMKMId === umkmId;
                      const selectedItemsInUMKM = umkmData.items.filter(item => selectedItems.has(item.id));
                      const selectedTotal = selectedItemsInUMKM.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
                      const allItemsSelected = umkmData.items.every(item => selectedItems.has(item.id));
                      const someItemsSelected = umkmData.items.some(item => selectedItems.has(item.id));
                      return (
                        <div
                          key={umkmId}
                          className={`border-2 rounded-xl overflow-hidden transition-all ${isSelected
                            ? "border-green-500 shadow-lg shadow-green-100 dark:shadow-green-900/30"
                            : "border-gray-200 dark:border-gray-700"
                            }`}
                        >
                          {/* UMKM Header with Checkbox */}
                          <div
                            className={`p-3 flex items-center gap-3 ${isSelected
                              ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30"
                              : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600"
                              }`}
                          >
                            {/* Checkbox - Select/Deselect all items in this UMKM */}
                            <button
                              onClick={() => handleToggleSelect(umkmId)}
                              className={`p-1 rounded transition-colors ${allItemsSelected
                                ? "text-green-600 dark:text-green-400"
                                : someItemsSelected
                                  ? "text-blue-500 dark:text-blue-400"
                                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                }`}
                            >
                              {allItemsSelected ? (
                                <CheckSquare className="size-6" />
                              ) : someItemsSelected ? (
                                <CheckSquare className="size-6 opacity-60" />
                              ) : (
                                <Square className="size-6" />
                              )}
                            </button>

                            {/* UMKM Info */}
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => handleToggleExpand(umkmId)}
                            >
                              <div className="flex items-center gap-2">
                                <Store className="size-4 text-indigo-600 dark:text-indigo-400" />
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {umkmData.umkmName}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedItemsInUMKM.length > 0
                                  ? `${selectedItemsInUMKM.length}/${umkmData.items.length} item terpilih • ${formatPrice(selectedTotal)}`
                                  : `${umkmData.items.length} item • ${formatPrice(umkmData.total)}`
                                }
                              </p>
                            </div>

                            {/* Expand Toggle */}
                            <button
                              onClick={() => handleToggleExpand(umkmId)}
                              className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-full transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-5 text-gray-600 dark:text-gray-400" />
                              ) : (
                                <ChevronRight className="size-5 text-gray-600 dark:text-gray-400" />
                              )}
                            </button>
                          </div>

                          {/* Expanded Item List */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700"
                              >
                                {umkmData.items.map((item) => {
                                  const isItemSelected = selectedItems.has(item.id);
                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${isItemSelected ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                                    >
                                      <div className="flex gap-3">
                                        {/* Item Checkbox */}
                                        <button
                                          onClick={() => handleToggleSelectItem(item.id)}
                                          className={`p-1 rounded transition-colors flex-shrink-0 ${isItemSelected
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            }`}
                                        >
                                          {isItemSelected ? (
                                            <CheckSquare className="size-5" />
                                          ) : (
                                            <Square className="size-5" />
                                          )}
                                        </button>

                                        {/* Product Image */}
                                        {item.image && (
                                          <ImageWithFallback
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                          />
                                        )}

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                            {item.name}
                                          </p>
                                          {/* Variant Info */}
                                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                              {Object.entries(item.selectedVariants).map(([typeName, variant]) => (
                                                <span
                                                  key={typeName}
                                                  className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-medium"
                                                >
                                                  {typeName}: {variant.value}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                                            {formatPrice(item.price || 0)}
                                          </p>

                                          {/* Quantity Controls */}
                                          <div className="flex items-center gap-2 mt-2">
                                            <button
                                              onClick={() =>
                                                updateQuantity(
                                                  item.id,
                                                  item.quantity - 1
                                                )
                                              }
                                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                                            >
                                              <Minus className="size-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                            <span className="w-8 text-center font-semibold text-sm text-gray-900 dark:text-white">
                                              {item.quantity}
                                            </span>
                                            <button
                                              onClick={() =>
                                                updateQuantity(
                                                  item.id,
                                                  item.quantity + 1
                                                )
                                              }
                                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                                            >
                                              <Plus className="size-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                removeFromCart(item.id)
                                              }
                                              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                                            >
                                              <Trash2 className="size-4 text-red-600 dark:text-red-400" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer with Checkout Button */}
              {umkmList.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 space-y-3">
                  {/* Selected UMKM Summary */}
                  {selectedUMKMData && (
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-400">
                            Checkout dari:
                          </p>
                          <p className="font-semibold text-green-800 dark:text-green-300">
                            {selectedUMKMData.umkmName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-700 dark:text-green-400">
                            Total:
                          </p>
                          <p className="font-bold text-lg text-green-800 dark:text-green-300">
                            {formatPrice(selectedUMKMData.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total Terpilih - hanya tampil jika ada item yang dipilih */}
                  {!selectedUMKMData && selectedItems.size > 0 && (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Total Terpilih:
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          ({selectedItems.size} item)
                        </span>
                      </div>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatPrice(
                          cartItems
                            .filter(item => selectedItems.has(item.id))
                            .reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0)
                        )}
                      </span>
                    </div>
                  )}

                  {/* Checkout Button */}
                  {(() => {
                    const selectedByUMKM = getSelectedItemsByUMKM();
                    const umkmCount = Object.keys(selectedByUMKM).length;
                    const hasSelectedItems = selectedItems.size > 0;
                    const canCheckout = hasSelectedItems && umkmCount === 1;

                    return (
                      <>
                        <button
                          onClick={handleCheckout}
                          disabled={!canCheckout}
                          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${canCheckout
                            ? "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          <MessageCircle className="size-5" />
                          {canCheckout
                            ? "Checkout via WhatsApp"
                            : hasSelectedItems && umkmCount > 1
                              ? "Pilih dari 1 toko saja"
                              : "Pilih item untuk Checkout"}
                        </button>

                        {!hasSelectedItems && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Centang kotak item yang ingin di-checkout
                          </p>
                        )}
                        {hasSelectedItems && umkmCount > 1 && (
                          <p className="text-xs text-orange-500 dark:text-orange-400 text-center">
                            Checkout hanya bisa dari 1 toko per transaksi
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WhatsApp Checkout Modal */}
      {showWhatsAppCheckout && selectedUMKMData && selectedUMKMId && (
        <WhatsAppCheckoutModal
          isOpen={showWhatsAppCheckout}
          onClose={() => setShowWhatsAppCheckout(false)}
          umkmName={selectedUMKMData.umkmName}
          umkmWhatsapp={selectedUMKMData.umkmWhatsapp}
          umkmLocation={selectedUMKMData.umkmLocation}
          buyerName={user?.name || user?.nama_lengkap}
          buyerPhone={user?.phone || user?.no_hp || ""}
          businessId={selectedUMKMId}
          items={selectedUMKMData.items}
          total={selectedUMKMData.total}
          onCheckoutComplete={handleCheckoutComplete}
          namaBank={selectedUMKMData.namaBank}
          noRekening={selectedUMKMData.noRekening}
          atasNama={selectedUMKMData.atasNama}
          menyediakanJasaKirim={selectedUMKMData.menyediakanJasaKirim}
        />
      )}
    </>
  );
}
