import { useState, useEffect } from "react";
import { X, Package, Clock, Store, MessageCircle, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { orderService } from "../services/orderService";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface OrderItem {
  id: string;
  product_id: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  product?: {
    id: string;
    nama_produk: string;
    image_url?: string;
    gambar?: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  business_id: string;
  no_whatsapp_pembeli: string;
  catatan?: string;
  catatan_pembayaran?: string;
  total_harga: number;
  status: string;
  status_umkm?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  business?: {
    id: string;
    nama_usaha?: string;
    nama_umkm?: string;
    no_whatsapp?: string;
    user?: {
      name?: string;
      nama_lengkap?: string;
    };
  };
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      loadOrders();
    }
  }, [isOpen, user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getUserOrders();
      setOrders(data as unknown as Order[]);
      // Default all orders to expanded
      setExpandedOrders(new Set((data as unknown as Order[]).map(o => o.id)));
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Gagal memuat riwayat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "paid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "processing":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Pembayaran";
      case "paid":
        return "Sudah Dibayar";
      case "processing":
        return "Sedang Diproses";
      case "shipped":
        return "Dikirim / Siap Diambil";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleUpdateStatus = async (orderId: string, newStatus: 'paid' | 'completed' | 'cancelled') => {
    setUpdatingStatus(orderId);
    try {
      const note = paymentNotes[orderId];
      await orderService.updateStatusByCustomer(orderId, newStatus, note);
      toast.success(`Status berhasil diubah ke "${getStatusText(newStatus)}"`);
      await loadOrders();
    } catch (error: unknown) {
      console.error("Failed to update status:", error);
      const message = error instanceof Error ? error.message : "Gagal mengubah status";
      toast.error(message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleResendWhatsApp = async (order: Order) => {
    try {
      const data = await orderService.getWhatsAppLink(order.id);
      window.open(data.whatsapp_link, "_blank");
    } catch {
      // Fallback: generate link manually
      const businessPhone = order.business?.no_whatsapp || "";
      if (businessPhone) {
        const cleanPhone = businessPhone.replace(/\D/g, "").replace(/^0/, "62");
        const waLink = `https://wa.me/${cleanPhone}`;
        window.open(waLink, "_blank");
      } else {
        toast.error("Nomor WhatsApp UMKM tidak tersedia");
      }
    }
  };

  const getBusinessName = (order: Order) => {
    return order.business?.nama_usaha ||
      order.business?.nama_umkm ||
      order.business?.user?.name ||
      order.business?.user?.nama_lengkap ||
      "UMKM";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center gap-3 text-white">
            <Package className="size-6" />
            <h2 className="text-xl font-bold">Riwayat Pesanan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="size-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Memuat pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="size-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">Belum ada riwayat pesanan</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Pesanan Anda akan muncul di sini setelah checkout
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const isUpdating = updatingStatus === order.id;

                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
                  >
                    {/* Order Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {getBusinessName(order)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Store className="size-4" />
                              <span>{getBusinessName(order)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-4" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                            <p className="font-bold text-indigo-600 dark:text-indigo-400">
                              {formatCurrency(order.total_harga)}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="size-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="size-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        {/* Order Items */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Item Pesanan ({order.items?.length || 0})
                          </p>
                          <div className="space-y-2">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg">
                                {item.product?.image_url || item.product?.gambar ? (
                                  <ImageWithFallback
                                    src={item.product.image_url || item.product.gambar || ""}
                                    alt={item.product?.nama_produk || "Product"}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <Package className="size-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {item.product?.nama_produk || "Produk"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.jumlah}x {formatCurrency(item.harga_satuan)}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(item.subtotal)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Note Input (for pending orders) */}
                        {order.status === "pending" && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              📝 Catatan Pembayaran (opsional)
                            </label>
                            <textarea
                              value={paymentNotes[order.id] || ""}
                              onChange={(e) => setPaymentNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                              placeholder="Contoh: Transfer via BCA Rp 150.000 an. John Doe"
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                              rows={2}
                            />
                          </div>
                        )}

                        {/* Existing Payment Note */}
                        {order.catatan_pembayaran && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                              📝 Catatan Pembayaran:
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                              {order.catatan_pembayaran}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                          {/* WhatsApp Button - Always show */}
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleResendWhatsApp(order); }}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <MessageCircle className="size-4" />
                            Chat WhatsApp
                          </Button>

                          {/* Status Update Buttons based on current status */}
                          {order.status === "pending" && (
                            <>
                              <Button
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, "paid"); }}
                                disabled={isUpdating}
                                size="sm"
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                              >
                                {isUpdating ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="size-4" />
                                )}
                                Sudah Bayar
                              </Button>
                              <Button
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, "cancelled"); }}
                                disabled={isUpdating}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <XCircle className="size-4" />
                                Batalkan
                              </Button>
                            </>
                          )}

                          {(order.status === "processing" || order.status === "shipped") && (
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, "completed"); }}
                              disabled={isUpdating}
                              size="sm"
                              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                            >
                              {isUpdating ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <CheckCircle className="size-4" />
                              )}
                              Terima Pesanan
                            </Button>
                          )}

                          {order.status === "paid" && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                              Menunggu konfirmasi dari UMKM...
                            </p>
                          )}

                          {order.status === "completed" && (
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                              ✅ Pesanan selesai
                            </p>
                          )}

                          {order.status === "cancelled" && (
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                              ❌ Pesanan dibatalkan
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Button onClick={onClose} variant="outline" className="w-full">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
