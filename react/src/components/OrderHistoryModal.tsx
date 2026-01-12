import { useState, useEffect } from "react";
import { X, Package, Clock, MapPin, Truck, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { TrackingModal } from "./TrackingModal";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  businessName: string;
  image?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  hasTracking: boolean;
  userId: string;
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      loadOrders();
    }
  }, [isOpen, user]);

  const loadOrders = () => {
    // Load orders from localStorage
    const allOrders = localStorage.getItem("pasar_umkm_orders");
    if (allOrders) {
      const parsedOrders: Order[] = JSON.parse(allOrders);
      // Filter orders for current user and add tracking status
      let userOrders: Order[] = [];

      if (user) {
        userOrders = parsedOrders.filter(
          (order) =>
            order.userId === user.id ||
            order.shippingAddress?.name === user.name
        );
      } else {
        // If no user logged in, show recent orders (guest mode)
        userOrders = parsedOrders.filter((order) => order.userId === "guest");
      }

      userOrders = userOrders
        .map((order) => ({
          ...order,
          hasTracking: localStorage.getItem(`tracking_${order.id}`) !== null,
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setOrders(userOrders);
    } else {
      setOrders([]);
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
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Pembayaran";
      case "processing":
        return "Sedang Diproses";
      case "shipped":
        return "Sedang Dikirim";
      case "delivered":
        return "Terkirim";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsTrackingOpen(true);
  };

  const handleSkipPayment = (orderId: string) => {
    // Update order status to processing
    const allOrders = localStorage.getItem("pasar_umkm_orders");
    if (allOrders) {
      const parsedOrders: Order[] = JSON.parse(allOrders);
      const updatedOrders = parsedOrders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: "processing" as const };
        }
        return order;
      });
      localStorage.setItem("pasar_umkm_orders", JSON.stringify(updatedOrders));

      // Update tracking to processing
      const trackingData = localStorage.getItem(`tracking_${orderId}`);
      if (trackingData) {
        const tracking = JSON.parse(trackingData);
        const now = new Date();

        tracking.currentStatus = "payment_confirmed";
        tracking.currentStatusText = "Pembayaran Dikonfirmasi";
        tracking.history.push({
          id: `hist_${tracking.history.length}`,
          status: "payment_confirmed",
          statusText: "Pembayaran Dikonfirmasi",
          location: tracking.shippingCity,
          description: "Pembayaran telah dikonfirmasi, pesanan sedang dikemas",
          timestamp: now.toISOString(),
          icon: "check",
        });

        localStorage.setItem(`tracking_${orderId}`, JSON.stringify(tracking));
      }

      loadOrders();
      toast.success("Pembayaran berhasil! Pesanan sedang diproses.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Riwayat Pesanan
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Belum ada riwayat pesanan</p>
                <p className="text-sm text-gray-500">
                  Pesanan Anda akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">
                            Order #{order.id.slice(-8)}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {order.shippingAddress.city}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.businessName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-900">
                                {item.quantity}x {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Alamat Pengiriman
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.name} -{" "}
                        {order.shippingAddress.phone}
                        <br />
                        {order.shippingAddress.address},{" "}
                        {order.shippingAddress.city}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {(order.status === "processing" ||
                        order.status === "shipped" ||
                        order.status === "delivered") && (
                        <Button
                          onClick={() => handleTrackOrder(order.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          {order.hasTracking ? "Lacak Pesanan" : "Lihat Status"}
                        </Button>
                      )}
                      {order.status === "pending" && (
                        <Button
                          onClick={() => handleSkipPayment(order.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          Bayar Sekarang
                        </Button>
                      )}
                      {order.status === "delivered" && (
                        <Button variant="outline" className="flex-1">
                          Beli Lagi
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <Button onClick={onClose} variant="outline" className="w-full">
              Tutup
            </Button>
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {selectedOrderId && (
        <TrackingModal
          isOpen={isTrackingOpen}
          onClose={() => {
            setIsTrackingOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      )}
    </>
  );
}
