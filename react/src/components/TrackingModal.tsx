import { useState, useEffect } from "react";
import {
  X,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface TrackingHistory {
  id: string;
  status: string;
  statusText: string;
  location: string;
  description: string;
  timestamp: string;
  icon?: "package" | "truck" | "location" | "check" | "alert";
}

interface TrackingInfo {
  trackingNumber: string;
  courier: string;
  courierName: string;
  currentStatus: string;
  currentStatusText: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  orderId: string;
  shippingAddress: string;
  shippingCity: string;
  history: TrackingHistory[];
}

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export function TrackingModal({
  isOpen,
  onClose,
  orderId,
}: TrackingModalProps) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      loadTrackingInfo();
    }
  }, [isOpen, orderId]);

  const loadTrackingInfo = () => {
    setIsLoading(true);

    // Load from localStorage (simulate API call)
    const trackingData = localStorage.getItem(`tracking_${orderId}`);

    if (trackingData) {
      setTrackingInfo(JSON.parse(trackingData));
    } else {
      // Generate dummy tracking if not exists
      generateDummyTracking();
    }

    setIsLoading(false);
  };

  const generateDummyTracking = () => {
    const couriers = [
      { code: "JNE", name: "JNE Express" },
      { code: "JNT", name: "J&T Express" },
      { code: "SICEPAT", name: "SiCepat Express" },
    ];

    const courier = couriers[Math.floor(Math.random() * couriers.length)];
    const now = new Date();
    const trackingNumber = `${courier.code}-${now.getFullYear()}${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${now
      .getDate()
      .toString()
      .padStart(2, "0")}-${Math.random()
      .toString(36)
      .substr(2, 8)
      .toUpperCase()}`;

    const statuses = [
      {
        status: "order_created",
        statusText: "Pesanan Dibuat",
        location: "Jakarta",
        description: "Pesanan telah dibuat dan menunggu konfirmasi pembayaran",
        icon: "package" as const,
        hoursAgo: 48,
      },
      {
        status: "payment_confirmed",
        statusText: "Pembayaran Dikonfirmasi",
        location: "Jakarta",
        description:
          "Pembayaran telah dikonfirmasi, pesanan akan segera diproses",
        icon: "check" as const,
        hoursAgo: 46,
      },
      {
        status: "processing",
        statusText: "Sedang Diproses",
        location: "Jakarta",
        description: "Pesanan sedang dikemas oleh penjual",
        icon: "package" as const,
        hoursAgo: 36,
      },
      {
        status: "picked_up",
        statusText: "Diambil Kurir",
        location: "Jakarta",
        description: `Paket telah diambil oleh kurir ${courier.name}`,
        icon: "truck" as const,
        hoursAgo: 24,
      },
      {
        status: "in_transit",
        statusText: "Dalam Perjalanan",
        location: "Bandung",
        description: "Paket dalam perjalanan ke kota tujuan",
        icon: "truck" as const,
        hoursAgo: 12,
      },
      {
        status: "arrived_at_destination",
        statusText: "Tiba di Kota Tujuan",
        location: "Surabaya",
        description: "Paket telah tiba di kota tujuan dan akan segera dikirim",
        icon: "location" as const,
        hoursAgo: 4,
      },
      {
        status: "out_for_delivery",
        statusText: "Sedang Dikirim",
        location: "Surabaya",
        description: "Paket sedang dalam pengiriman oleh kurir",
        icon: "truck" as const,
        hoursAgo: 1,
      },
    ];

    const numStatuses = Math.floor(Math.random() * 3) + 5; // 5-7 statuses
    const selectedStatuses = statuses.slice(0, numStatuses);

    const history = selectedStatuses
      .map((status, index) => {
        const timestamp = new Date(
          now.getTime() - status.hoursAgo * 60 * 60 * 1000
        );
        return {
          id: `hist_${index}`,
          status: status.status,
          statusText: status.statusText,
          location: status.location,
          description: status.description,
          timestamp: timestamp.toISOString(),
          icon: status.icon,
        };
      })
      .reverse();

    const currentStatus = selectedStatuses[selectedStatuses.length - 1];
    const estimatedDelivery = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tracking: TrackingInfo = {
      trackingNumber,
      courier: courier.code,
      courierName: courier.name,
      currentStatus: currentStatus.status,
      currentStatusText: currentStatus.statusText,
      estimatedDelivery: estimatedDelivery.toISOString(),
      orderId,
      shippingAddress: "Jl. Raya Pasar No. 123",
      shippingCity: "Surabaya",
      history,
    };

    setTrackingInfo(tracking);

    // Save to localStorage
    localStorage.setItem(`tracking_${orderId}`, JSON.stringify(tracking));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    if (status.includes("delivered")) return "text-green-600";
    if (status.includes("failed") || status.includes("returned"))
      return "text-red-600";
    if (status.includes("out_for_delivery")) return "text-blue-600";
    return "text-indigo-600";
  };

  const getStatusIcon = (icon?: string) => {
    switch (icon) {
      case "package":
        return <Package className="w-5 h-5" />;
      case "truck":
        return <Truck className="w-5 h-5" />;
      case "location":
        return <MapPin className="w-5 h-5" />;
      case "check":
        return <CheckCircle className="w-5 h-5" />;
      case "alert":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handleSkipToNextStep = () => {
    if (!trackingInfo) return;

    const allSteps = [
      {
        status: "payment_confirmed",
        statusText: "Pembayaran Dikonfirmasi",
        description: "Pembayaran telah dikonfirmasi, pesanan sedang dikemas",
        icon: "check" as const,
      },
      {
        status: "processing",
        statusText: "Sedang Dikemas",
        description: "Pesanan sedang dikemas oleh penjual",
        icon: "package" as const,
      },
      {
        status: "picked_up",
        statusText: "Diambil Kurir",
        description: `Paket telah diambil oleh kurir ${trackingInfo.courierName}`,
        icon: "truck" as const,
      },
      {
        status: "in_transit",
        statusText: "Dalam Perjalanan",
        description: "Paket dalam perjalanan ke kota tujuan",
        icon: "truck" as const,
      },
      {
        status: "arrived_at_destination",
        statusText: "Tiba di Kota Tujuan",
        description: "Paket telah tiba di kota tujuan",
        icon: "location" as const,
      },
      {
        status: "out_for_delivery",
        statusText: "Sedang Dikirim",
        description: "Paket sedang dalam pengiriman oleh kurir",
        icon: "truck" as const,
      },
      {
        status: "delivered",
        statusText: "Terkirim",
        description: "Paket telah diterima",
        icon: "check" as const,
      },
    ];

    // Find current step index
    const currentStepIndex = allSteps.findIndex(
      (step) => step.status === trackingInfo.currentStatus
    );

    // Check if we can move to next step
    if (currentStepIndex >= allSteps.length - 1) {
      toast.info("Paket sudah sampai di tujuan!");
      return;
    }

    // Get next step
    const nextStep = allSteps[currentStepIndex + 1];
    const now = new Date();

    // Update tracking info
    const updatedTracking = {
      ...trackingInfo,
      currentStatus: nextStep.status,
      currentStatusText: nextStep.statusText,
      history: [
        {
          id: `hist_${trackingInfo.history.length}`,
          status: nextStep.status,
          statusText: nextStep.statusText,
          location: trackingInfo.shippingCity,
          description: nextStep.description,
          timestamp: now.toISOString(),
          icon: nextStep.icon,
        },
        ...trackingInfo.history,
      ],
      actualDelivery:
        nextStep.status === "delivered"
          ? now.toISOString()
          : trackingInfo.actualDelivery,
    };

    // Save to localStorage
    localStorage.setItem(
      `tracking_${orderId}`,
      JSON.stringify(updatedTracking)
    );
    setTrackingInfo(updatedTracking);

    // Update order status if delivered
    if (nextStep.status === "delivered") {
      const allOrders = localStorage.getItem("pasar_umkm_orders");
      if (allOrders) {
        const orders = JSON.parse(allOrders);
        const updatedOrders = orders.map((order: any) => {
          if (order.id === orderId) {
            return { ...order, status: "delivered" };
          }
          return order;
        });
        localStorage.setItem(
          "pasar_umkm_orders",
          JSON.stringify(updatedOrders)
        );
      }
      toast.success("🎉 Paket telah sampai di tujuan!");
    } else if (
      nextStep.status === "shipped" ||
      nextStep.status === "out_for_delivery"
    ) {
      const allOrders = localStorage.getItem("pasar_umkm_orders");
      if (allOrders) {
        const orders = JSON.parse(allOrders);
        const updatedOrders = orders.map((order: any) => {
          if (order.id === orderId) {
            return { ...order, status: "shipped" };
          }
          return order;
        });
        localStorage.setItem(
          "pasar_umkm_orders",
          JSON.stringify(updatedOrders)
        );
      }
      toast.success(`📦 ${nextStep.statusText}`);
    } else {
      toast.success(`✅ ${nextStep.statusText}`);
    }
  };

  const canAdvanceToNextStep = () => {
    if (!trackingInfo) return false;
    return trackingInfo.currentStatus !== "delivered";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Lacak Pengiriman
            </h2>
            {trackingInfo && (
              <p className="text-sm text-gray-600 mt-1">
                Order ID: {trackingInfo.orderId}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat informasi tracking...</p>
              </div>
            </div>
          ) : trackingInfo ? (
            <div className="space-y-6">
              {/* Tracking Number & Courier */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Nomor Resi</p>
                    <p className="text-lg font-bold text-gray-900">
                      {trackingInfo.trackingNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {trackingInfo.courierName}
                    </span>
                  </div>
                </div>

                {/* Current Status */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Status Terkini</p>
                  <p
                    className={`font-bold ${getStatusColor(
                      trackingInfo.currentStatus
                    )}`}
                  >
                    {trackingInfo.currentStatusText}
                  </p>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Estimasi Tiba
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(trackingInfo.estimatedDelivery)}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Alamat Pengiriman
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {trackingInfo.shippingAddress}
                    <br />
                    {trackingInfo.shippingCity}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Riwayat Pengiriman
                </h3>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {/* Timeline Items */}
                  <div className="space-y-6">
                    {trackingInfo.history.map((item, index) => (
                      <div key={item.id} className="relative flex gap-4">
                        {/* Icon */}
                        <div
                          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                            index === 0
                              ? "bg-indigo-600 text-white"
                              : "bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {getStatusIcon(item.icon)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between mb-1">
                            <p
                              className={`font-medium ${
                                index === 0
                                  ? "text-indigo-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.statusText}
                            </p>
                            {index === 0 && (
                              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                Terbaru
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(item.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Courier Link */}
              <div className="border-t border-gray-200 pt-4">
                <a
                  href={`https://www.${trackingInfo.courier.toLowerCase()}.co.id`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">
                    Lacak di website {trackingInfo.courierName}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Informasi tracking tidak ditemukan
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3">
            {canAdvanceToNextStep() && trackingInfo && (
              <Button
                onClick={handleSkipToNextStep}
                variant="outline"
                className="flex-1 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Lanjut ke Step Berikutnya
              </Button>
            )}
            <Button
              onClick={onClose}
              className={canAdvanceToNextStep() ? "flex-1" : "w-full"}
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
