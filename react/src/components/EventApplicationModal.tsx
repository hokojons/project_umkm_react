import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Calendar, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  status: string;
}

interface Business {
  id: string;
  name: string;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface EventApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function EventApplicationModal({
  isOpen,
  onClose,
  eventId,
}: EventApplicationModalProps) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEvent();
      fetchMyBusinesses();
    }
  }, [isOpen, eventId]);

  const fetchEvent = () => {
    // Pakai localStorage saja
    const localEvents = localStorage.getItem("pasar_umkm_events");
    if (localEvents) {
      const events = JSON.parse(localEvents);
      const foundEvent = events.find((e: Event) => e.id === eventId);
      setEvent(foundEvent || null);
    }
  };

  const fetchMyBusinesses = () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Pakai localStorage saja
    const localBusinesses = localStorage.getItem("pasar_umkm_businesses");
    const localProducts = localStorage.getItem("pasar_umkm_products");

    if (localBusinesses && localProducts) {
      const allBusinesses = JSON.parse(localBusinesses);
      const allProducts = JSON.parse(localProducts);

      // Filter businesses owned by current user
      const myBusiness = allBusinesses.filter(
        (b: any) => b.ownerEmail === user.email
      );

      // Attach products to each business
      const businessesWithProducts = myBusiness.map((business: any) => {
        const businessProducts = allProducts.filter(
          (p: any) => p.businessId === business.id
        );
        return { ...business, products: businessProducts };
      });

      setMyBusinesses(businessesWithProducts);

      // Auto-select first business if available
      if (businessesWithProducts.length > 0) {
        setSelectedBusinessId(businessesWithProducts[0].id);
      }
    }

    setIsLoading(false);
  };

  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBusinessId) {
      toast.error("Pilih toko yang akan didaftarkan");
      return;
    }

    if (selectedProducts.size === 0) {
      toast.error("Pilih minimal 1 produk yang akan dijual");
      return;
    }

    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    setIsSubmitting(true);

    const selectedBusiness = myBusinesses.find(
      (b) => b.id === selectedBusinessId
    );
    const productsToSubmit =
      selectedBusiness?.products
        .filter((p) => selectedProducts.has(p.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
        })) || [];

    // Save to localStorage
    const localApplications = localStorage.getItem(
      "pasar_umkm_event_applications"
    );
    const currentApplications = localApplications
      ? JSON.parse(localApplications)
      : [];

    const newApplication = {
      id: `app_${Date.now()}`,
      eventId,
      umkmId: user.id,
      umkmEmail: user.email,
      umkmName: user.name,
      businessId: selectedBusinessId,
      products: productsToSubmit,
      notes,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    currentApplications.push(newApplication);
    localStorage.setItem(
      "pasar_umkm_event_applications",
      JSON.stringify(currentApplications)
    );

    toast.success(
      "Aplikasi berhasil dikirim! Admin akan meninjau pendaftaran Anda."
    );
    setIsSubmitting(false);
    onClose();

    // Reset form
    setSelectedBusinessId("");
    setSelectedProducts(new Set());
    setNotes("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  const selectedBusiness = myBusinesses.find(
    (b) => b.id === selectedBusinessId
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2>Daftar Berjualan di Event</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : myBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Anda belum memiliki toko yang terdaftar. Silakan ajukan toko
              terlebih dahulu untuk bisa mendaftar di event.
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        ) : (
          <>
            {/* Event Info */}
            {event && (
              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <h3 className="mb-2">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-3">
                  {event.description}
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="size-4" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="size-4" />
                    {event.location}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pilih Toko
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => {
                    setSelectedBusinessId(e.target.value);
                    setSelectedProducts(new Set()); // Reset product selection
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {myBusinesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name} ({business.products.length} produk)
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Selection */}
              {selectedBusiness && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pilih Produk yang Akan Dijual ({selectedProducts.size}{" "}
                    dipilih)
                  </label>
                  {selectedBusiness.products.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                      Toko ini belum memiliki produk. Tambahkan produk terlebih
                      dahulu melalui Dashboard UMKM.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                      {selectedBusiness.products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductToggle(product.id)}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedProducts.has(product.id)
                              ? "border-indigo-600 bg-indigo-50"
                              : "border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex gap-3">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="text-sm font-medium">
                                  {product.name}
                                </h4>
                                {selectedProducts.has(product.id) && (
                                  <CheckCircle className="size-5 text-indigo-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-indigo-600 font-medium">
                                {formatCurrency(product.price)}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Catatan Tambahan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                  placeholder="Tuliskan informasi tambahan yang perlu admin ketahui..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || selectedProducts.size === 0}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Aplikasi"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
