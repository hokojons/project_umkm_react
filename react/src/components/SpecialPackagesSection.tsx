import { useState, useEffect } from "react";
import { Gift, ShoppingCart, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

interface GiftPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  items: string[];
  createdAt: string;
}

export function SpecialPackagesSection() {
  const [packages, setPackages] = useState<GiftPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<GiftPackage | null>(
    null
  );
  const { addToCart } = useCart();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/gift-packages');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setPackages(data.data);
      } else {
        setPackages([]);
      }
    } catch (error) {
      console.error('Error loading gift packages:', error);
      setPackages([]);
    }
  };

  const handleAddToCart = (pkg: GiftPackage) => {
    // Convert image to full URL
    let imageUrl = pkg.image;
    if (pkg.image && !(pkg.image.startsWith('http://') || pkg.image.startsWith('https://'))) {
      imageUrl = `http://localhost:8000/${pkg.image}`;
    }
    
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      image: imageUrl,
      standName: "🎁 Paket Spesial",
      standId: "special_packages",
    });
    toast.success(`${pkg.name} ditambahkan ke keranjang!`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Don't render if no packages
  if (packages.length === 0) {
    return null;
  }

  return (
    <>
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <Sparkles className="size-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-indigo-600 dark:text-indigo-400">
                Paket Spesial
              </h2>
              <Sparkles className="size-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Paket hadiah istimewa yang dikurasi khusus untuk momen spesial
              Anda
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setSelectedPackage(pkg)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pkg.image && (pkg.image.startsWith('http://') || pkg.image.startsWith('https://')) 
                      ? pkg.image 
                      : pkg.image 
                        ? `http://localhost:8000/${pkg.image}` 
                        : '/api/placeholder/400/300'}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full shadow-lg flex items-center gap-1">
                      <Gift className="size-3" />
                      {pkg.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[40px]">
                    {pkg.description}
                  </p>

                  {/* Items Preview */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                      Berisi {pkg.items?.length || 0} item:
                    </p>
                    <div className="space-y-1">
                      {pkg.items && pkg.items.length > 0 ? (
                        <>
                          {pkg.items.slice(0, 2).map((item, idx) => (
                            <p
                              key={idx}
                              className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2"
                            >
                              <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                                ✓
                              </span>
                              <span className="line-clamp-1">{item}</span>
                            </p>
                          ))}
                          {pkg.items.length > 2 && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              +{pkg.items.length - 2} item lainnya
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(pkg.price)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(pkg);
                      }}
                      className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2 text-sm"
                    >
                      <ShoppingCart className="size-4" />
                      <span className="hidden sm:inline">Tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPackage(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative h-64 md:h-80">
              <img
                src={selectedPackage.image && (selectedPackage.image.startsWith('http://') || selectedPackage.image.startsWith('https://')) 
                  ? selectedPackage.image 
                  : selectedPackage.image 
                    ? `http://localhost:8000/${selectedPackage.image}` 
                    : '/api/placeholder/400/300'}
                alt={selectedPackage.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-full shadow-lg flex items-center gap-2">
                  <Gift className="size-4" />
                  {selectedPackage.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-gray-900 dark:text-gray-100 mb-3">
                  {selectedPackage.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedPackage.description}
                </p>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <h3 className="text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Gift className="size-5 text-indigo-600 dark:text-indigo-400" />
                  Isi Paket ({selectedPackage.items?.length || 0} item)
                </h3>
                <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 space-y-3">
                  {selectedPackage.items && selectedPackage.items.length > 0 ? (
                    selectedPackage.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 flex-1">
                          {item}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      {selectedPackage.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Harga Paket
                  </p>
                  <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(selectedPackage.price)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleAddToCart(selectedPackage);
                    setSelectedPackage(null);
                  }}
                  className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart className="size-5" />
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
