import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Star,
  TrendingUp,
  Award,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { foodStands } from "../data/stands";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

interface FeaturedProduct extends Product {
  businessName: string;
  businessId: string;
  badge?: "trending" | "top-rated" | "best-seller";
}

// Get top 2 products from each UMKM
const getFeaturedItems = (): FeaturedProduct[] => {
  const featured: FeaturedProduct[] = [];

  foodStands.forEach((stand) => {
    // Sort by price (higher price = premium items) and take top 2
    const topItems = [...stand.products]
      .sort((a, b) => b.price - a.price)
      .slice(0, 2)
      .map((item, index) => ({
        ...item,
        businessName: stand.name,
        businessId: stand.id,
        badge: index === 0 ? ("top-rated" as const) : ("best-seller" as const),
      }));

    featured.push(...topItems);
  });

  return featured;
};

export function FeaturedSection() {
  const featuredItems = getFeaturedItems();
  const { addToCart } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 480) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex, itemsPerView]);

  const maxIndex = Math.max(0, featuredItems.length - itemsPerView);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleItemClick = (businessId: string) => {
    // Find the business card and scroll to it
    const standElement = document.querySelector(
      `[data-stand-id=\"${businessId}\"]`
    );
    if (standElement) {
      standElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add highlight effect
      standElement.classList.add("ring-4", "ring-indigo-500", "ring-offset-4");
      setTimeout(() => {
        standElement.classList.remove(
          "ring-4",
          "ring-indigo-500",
          "ring-offset-4"
        );
      }, 2000);
    }
  };

  const getBadgeConfig = (badge?: FeaturedProduct["badge"]) => {
    switch (badge) {
      case "trending":
        return { icon: TrendingUp, text: "Trending", color: "bg-purple-500" };
      case "top-rated":
        return { icon: Award, text: "Top Rated", color: "bg-indigo-500" };
      case "best-seller":
        return { icon: Star, text: "Best Seller", color: "bg-blue-500" };
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      product: "Produk",
      food: "Kuliner",
      accessory: "Aksesoris",
      craft: "Kerajinan",
    };
    return labels[category] || "Produk";
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Star className="size-8 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
          <h2 className="text-gray-900 dark:text-gray-100">
            Produk Pilihan Minggu Ini
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Produk terpopuler dari setiap UMKM lokal
        </p>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        {featuredItems.length > itemsPerView && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors hidden sm:block"
            >
              <ChevronLeft className="size-6 text-indigo-600 dark:text-indigo-400" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors hidden sm:block"
            >
              <ChevronRight className="size-6 text-indigo-600 dark:text-indigo-400" />
            </button>
          </>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{
              x: `-${currentIndex * (100 / itemsPerView)}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {featuredItems.map((item) => {
              const badgeConfig = getBadgeConfig(item.badge);

              return (
                <motion.div
                  key={item.id}
                  className="flex-shrink-0"
                  style={{
                    width: `calc(${100 / itemsPerView}% - ${
                      ((itemsPerView - 1) * 16) / itemsPerView
                    }px)`,
                  }}
                >
                  <div className="group cursor-pointer h-full">
                    <div
                      onClick={() => handleItemClick(item.businessId)}
                      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback
                          src={item.image || ""}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Badge */}
                        {badgeConfig && (
                          <div
                            className={`absolute top-3 left-3 ${badgeConfig.color} text-white px-3 py-1 rounded-full text-xs flex items-center gap-1`}
                          >
                            <badgeConfig.icon className="size-3" />
                            <span>{badgeConfig.text}</span>
                          </div>
                        )}

                        {/* Quick Add to Cart */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item, item.businessName, item.businessId);
                          }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <div className="bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 rounded-full p-3 hover:bg-indigo-600 hover:text-white transition-colors">
                            <ShoppingCart className="size-5" />
                          </div>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="mb-1 line-clamp-1 text-gray-900 dark:text-gray-100">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2 flex-1">
                          {item.description}
                        </p>

                        {/* Business Name */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                          <span className="truncate">{item.businessName}</span>
                        </div>

                        {/* Price and Category */}
                        <div className="flex items-center justify-between">
                          <div className="text-indigo-600 dark:text-indigo-400">
                            {formatPrice(item.price)}
                          </div>
                          <div className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded">
                            {getCategoryLabel(item.category)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        {featuredItems.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? "bg-indigo-600 dark:bg-indigo-400 w-8"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
