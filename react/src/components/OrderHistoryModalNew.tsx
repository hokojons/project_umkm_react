import { useState, useEffect } from "react";
import { X, MessageCircle, Loader, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPhoneNumber?: string;
}

interface OrderItem {
  product_id: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  product?: {
    id: string;
    nama: string;
    harga: number;
  };
}

interface Order {
  id: string;
  user_id: string;
  business_id: string;
  no_whatsapp_pembeli: string;
  catatan?: string;
  total_harga: number;
  status: string;
  status_umkm: string;
  created_at: string;
  items: OrderItem[];
  business?: {
    nama: string;
    no_whatsapp: string;
    alamat: string;
  };
  user?: {
    nama: string;
    alamat: string;
  };
}

const statusTranslation: Record<string, string> = {
  pending: "Menunggu",
  pending_confirmation: "Menunggu Konfirmasi UMKM",
  diproses: "Sedang Diproses",
  dikirim: "Sedang Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  pending_confirmation: "bg-yellow-100 text-yellow-800",
  diproses: "bg-blue-100 text-blue-800",
  dikirim: "bg-purple-100 text-purple-800",
  selesai: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
};

export function OrderHistoryModal({
  isOpen,
  onClose,
  userPhoneNumber,
}: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [waLink, setWaLink] = useState("");

  useEffect(() => {
    if (isOpen && userPhoneNumber) {
      fetchOrders();
    }
  }, [isOpen, userPhoneNumber]);

  // Fetch orders dari API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/orders/user/all",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userPhoneNumber || "",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setOrders(data.data || []);
      } else {
        toast.error(data.message || "Gagal mengambil riwayat pesanan");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Gagal menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  // Get WhatsApp link untuk order
  const handleContactUMKM = async (order: Order) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/orders/${order.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userPhoneNumber || "",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setWaLink(data.data.whatsapp_link);
        setSelectedOrder(order);
        window.open(data.data.whatsapp_link, "_blank");
        toast.success("WhatsApp terbuka!");
      } else {
        toast.error("Gagal membuat link WhatsApp");
      }
    } catch (error) {
      console.error("Error getting WhatsApp link:", error);
      toast.error("Gagal menghubungi server");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold">📦 Riwayat Pesanan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader size={32} className="animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Memuat pesanan...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">Belum ada pesanan</p>
              <p className="text-sm text-gray-500">
                Mulai berbelanja dan pesan dari UMKM favorit Anda
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[order.status_umkm] || "bg-gray-100"
                      }`}
                    >
                      {statusTranslation[order.status_umkm] ||
                        order.status_umkm}
                    </span>
                  </div>

                  {/* UMKM Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="font-semibold text-gray-900">
                      {order.business?.nama || "UMKM"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Phone size={14} />
                      <span>{order.business?.no_whatsapp || "-"}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-3 max-h-32 overflow-y-auto">
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            • {item.product?.nama || "Produk"} x{item.jumlah} =
                            Rp {(item.subtotal || 0).toLocaleString("id-ID")}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Tidak ada item</p>
                    )}
                  </div>

                  {/* Total & Notes */}
                  <div className="border-t border-gray-200 pt-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg text-green-600">
                        Rp {(order.total_harga || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {order.catatan && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Catatan:</span>{" "}
                        {order.catatan}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleContactUMKM(order)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle size={20} />
                    Hubungi UMKM via WhatsApp
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
