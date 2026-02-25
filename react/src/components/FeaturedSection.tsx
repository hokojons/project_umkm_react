import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { API_CONFIG } from "../config/api";

// Base URL without /api suffix for image URLs
const BASE_URL = API_CONFIG.BASE_URL.replace('/api', '');

interface SlideProduct {
  id: string;
  name: string;
  image: string;
  businessName: string;
}

// Generate a seed based on current date (changes daily)
const getDailySeed = () => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

// Seeded random shuffle function
const seededShuffle = <T,>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  let currentSeed = seed;

  for (let i = shuffled.length - 1; i > 0; i--) {
    // Simple seeded random
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

export function FeaturedSection() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<SlideProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/products`);
        const data = await response.json();

        if (data.success && data.data) {
          const allProducts: SlideProduct[] = data.data
            .filter((p: any) => p.status === "active" && (p.stok === null || p.stok > 0))
            .map((p: any) => ({
              id: String(p.id),
              name: p.nama_produk || p.nama,
              image: p.gambar && p.gambar.trim()
                ? (p.gambar.startsWith('http') || p.gambar.startsWith('data:')
                  ? p.gambar
                  : `${BASE_URL}/${p.gambar}`)
                : "https://images.unsplash.com/photo-1557821552-17105176677c?w=400",
              businessName: p.umkm?.nama_toko || p.nama_toko || "UMKM",
            }));

          // Shuffle with daily seed - products will be same order for the whole day
          const shuffled = seededShuffle(allProducts, getDailySeed());
          setProducts(shuffled);
        }
      } catch (error) {
        console.error("Error fetching products for slideshow:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 480) {
        setItemsPerView(2);
      } else if (window.innerWidth < 768) {
        setItemsPerView(3);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(4);
      } else {
        setItemsPerView(5);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (products.length <= itemsPerView) return;

    const timer = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex, itemsPerView, products.length]);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="size-8 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Jelajahi Produk UMKM
          </h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="size-8 text-orange-500 fill-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Jelajahi Produk UMKM
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Temukan berbagai produk menarik dari UMKM lokal
        </p>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        {products.length > itemsPerView && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors hidden sm:block"
            >
              <ChevronLeft className="size-6 text-orange-500" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors hidden sm:block"
            >
              <ChevronRight className="size-6 text-orange-500" />
            </button>
          </>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden rounded-xl">
          <motion.div
            className="flex gap-3"
            animate={{
              x: `-${currentIndex * (100 / itemsPerView)}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="flex-shrink-0"
                style={{
                  width: `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) * 12) / itemsPerView}px)`,
                }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div
                  onClick={() => handleProductClick(product.id)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1557821552-17105176677c?w=400";
                      }}
                    />
                    {/* Gradient overlay with name */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-lg">
                        {product.name}
                      </p>
                      <p className="text-white/80 text-xs mt-1 line-clamp-1">
                        {product.businessName}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        {products.length > itemsPerView && (
          <div className="flex justify-center gap-1.5 mt-4">
            {Array.from({ length: Math.min(maxIndex + 1, 10) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${currentIndex === index
                  ? "bg-orange-500 w-6"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 w-1.5"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
