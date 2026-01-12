import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  X,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCartClose: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  onCartClose,
}: CheckoutModalProps) {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load user profile data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const savedProfile = localStorage.getItem(
        `pasar_umkm_profile_${user.id}`
      );
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setShippingName(user.name || "");
        setShippingPhone(profileData.phone || "");
        setShippingAddress(profileData.address || "");
        setShippingCity(profileData.city || "");
        setShippingPostalCode(profileData.postalCode || "");
      } else {
        setShippingName(user.name || "");
        setShippingPhone("");
        setShippingAddress("");
        setShippingCity("");
        setShippingPostalCode("");
      }
    }
  }, [isOpen, user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const paymentMethods = [
    { id: "cash", name: "Tunai", icon: Banknote },
    { id: "debit", name: "Kartu Debit", icon: CreditCard },
    { id: "ewallet", name: "E-Wallet", icon: Wallet },
  ];

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPayment) {
      toast.error("Pilih metode pembayaran");
      return;
    }

    if (
      !shippingName ||
      !shippingPhone ||
      !shippingAddress ||
      !shippingCity ||
      !shippingPostalCode
    ) {
      toast.error("Lengkapi semua data pengiriman");
      return;
    }

    // Validate phone number
    if (!/^08\d{8,11}$/.test(shippingPhone)) {
      toast.error("Nomor telepon tidak valid. Gunakan format 08xxxxxxxxxx");
      return;
    }

    // Validate postal code
    if (!/^\d{5}$/.test(shippingPostalCode)) {
      toast.error("Kode pos harus 5 digit angka");
      return;
    }

    await processOrder();
  };

  const handleSkipPayment = async () => {
    // Fill with dummy data if empty
    const dummyName = shippingName || user?.name || "Customer Demo";
    const dummyPhone = shippingPhone || "081234567890";
    const dummyAddress = shippingAddress || "Jl. Contoh No. 123";
    const dummyCity = shippingCity || "Jakarta";
    const dummyPostalCode = shippingPostalCode || "12345";
    const dummyPayment = selectedPayment || "cash";

    // Set dummy data
    setShippingName(dummyName);
    setShippingPhone(dummyPhone);
    setShippingAddress(dummyAddress);
    setShippingCity(dummyCity);
    setShippingPostalCode(dummyPostalCode);
    setSelectedPayment(dummyPayment);

    await processOrder(
      dummyName,
      dummyPhone,
      dummyAddress,
      dummyCity,
      dummyPostalCode,
      dummyPayment
    );
  };

  const processOrder = async (
    name = shippingName,
    phone = shippingPhone,
    address = shippingAddress,
    city = shippingCity,
    postalCode = shippingPostalCode,
    payment = selectedPayment
  ) => {
    setIsProcessing(true);

    try {
      // Save profile to Laravel backend
      if (user?.id) {
        try {
          const profileResponse = await fetch(
            "http://localhost:8000/api/auth/profile",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-User-ID": user.id,
              },
              body: JSON.stringify({
                nama: name,
                telepon: phone,
                alamat: address,
                kota: city,
                kode_pos: postalCode,
              }),
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log("Profile updated in database:", profileData);
          }
        } catch (profileError) {
          console.error("Error saving profile to database:", profileError);
          // Continue even if profile update fails
        }
      }

      // Create order
      const orderId = `order_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const order = {
        id: orderId,
        userId: user?.id || "guest",
        items: cartItems,
        totalAmount: getTotalPrice(),
        shippingAddress: {
          name: name,
          phone: phone,
          address: address,
          city: city,
          postalCode: postalCode,
        },
        paymentMethod:
          payment === "cash"
            ? "cod"
            : payment === "debit"
            ? "bank_transfer"
            : "e_wallet",
        status: "pending",
        notes: notes,
        createdAt: new Date().toISOString(),
      };

      // Save order to localStorage
      const existingOrders = localStorage.getItem("pasar_umkm_orders");
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.push(order);
      localStorage.setItem("pasar_umkm_orders", JSON.stringify(orders));

      // Auto-generate tracking for the order (will be used when order status changes to 'processing')
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

      const tracking = {
        trackingNumber,
        courier: courier.code,
        courierName: courier.name,
        currentStatus: "order_created",
        currentStatusText: "Pesanan Dibuat",
        estimatedDelivery: new Date(
          now.getTime() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        orderId,
        shippingAddress: address,
        shippingCity: city,
        history: [
          {
            id: "hist_0",
            status: "order_created",
            statusText: "Pesanan Dibuat",
            location: city,
            description:
              "Pesanan telah dibuat dan menunggu konfirmasi pembayaran",
            timestamp: now.toISOString(),
            icon: "package",
          },
        ],
      };

      localStorage.setItem(`tracking_${orderId}`, JSON.stringify(tracking));

      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsProcessing(false);
      setIsSuccess(true);

      // Clear cart after 3 seconds and close modals
      setTimeout(() => {
        clearCart();
        onClose();
        onCartClose();
        toast.success(
          "Pesanan berhasil dibuat! Cek riwayat pesanan untuk tracking."
        );
      }, 3000);
    } catch (error) {
      setIsProcessing(false);
      toast.error("Gagal membuat pesanan. Silakan coba lagi.");
    }
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle2 className="size-20 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="mb-2">Pesanan Berhasil!</h2>
          <p className="text-gray-600 mb-4">
            Pesanan Anda sedang diproses. Silakan tunggu di meja Anda.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Total Pembayaran:{" "}
              <span className="text-orange-600">
                {formatPrice(getTotalPrice())}
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2>Checkout</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmitOrder}
          className="overflow-y-auto max-h-[calc(90vh-5rem)]"
        >
          {/* Order Summary */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 flex justify-between">
                <span>Total</span>
                <span className="text-orange-600">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="mb-4">Informasi Pelanggan</h3>

            {/* Info Box */}
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                <strong>💡 Tips:</strong> Lengkapi profile Anda di menu "Profile
                Saya" agar data pengiriman otomatis terisi.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  No. Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  placeholder="08xx xxxx xxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Masukkan alamat Anda..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Kota <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  placeholder="Masukkan nama kota..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Kode Pos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingPostalCode}
                  onChange={(e) => setShippingPostalCode(e.target.value)}
                  placeholder="Masukkan kode pos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk pesanan Anda..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6">
            <h3 className="mb-4">Metode Pembayaran</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 ${
                      selectedPayment === method.id
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`size-6 ${
                        selectedPayment === method.id
                          ? "text-orange-600"
                          : "text-gray-600"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        selectedPayment === method.id
                          ? "text-orange-600"
                          : "text-gray-700"
                      }`}
                    >
                      {method.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing
                ? "Memproses Pesanan..."
                : `Bayar ${formatPrice(getTotalPrice())}`}
            </button>

            {/* Skip Payment Button */}
            <button
              type="button"
              onClick={handleSkipPayment}
              disabled={isProcessing}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            >
              ⚡ Skip Pembayaran (Demo Mode)
            </button>
            <p className="text-xs text-gray-500 text-center">
              Mode demo: Otomatis menggunakan data contoh & langsung berhasil
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
