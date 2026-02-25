import React from "react";
import { ShoppingCart, Store, CreditCard } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getPlaceholderDataUrl } from "../utils/imageHelpers";
import ImageCarousel from "./ImageCarousel";
import { BASE_HOST } from "../config/api";

interface ProductCardProps {
  product: Product;
  businessName?: string;
  businessId?: string;
  onBuyNow?: (product: Product) => void;
}

export function ProductCard({ product, businessName, businessId, onBuyNow }: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // addToCart already handles login check and toast notifications
    addToCart(product, businessName || "Unknown", businessId || "");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = localStorage.getItem("pasar_umkm_current_user");

    if (!currentUser) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    // Call onBuyNow if provided for direct checkout (without adding to cart)
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      // Fallback: add to cart if no checkout handler provided
      addToCart(product, businessName || "Unknown", businessId || "");
    }
  };

  // Calculate stock display
  const stockAmount = product.stock ?? 0;
  const isLowStock = stockAmount > 0 && stockAmount <= 10;
  const isOutOfStock = !product.available || stockAmount === 0;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-200 dark:border-gray-600 hover:scale-105"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-600 overflow-hidden">
        {(product.all_images && product.all_images.length > 1) || (product.images && product.images.length > 1) ? (
          <ImageCarousel
            images={product.all_images || product.images || (product.image ? [product.image] : [])}
            aspectRatio="1/1"
            showDots={true}
            showArrows={true}
          />
        ) : (
          <img
            src={
              product.image?.startsWith('http://') || product.image?.startsWith('https://')
                ? product.image
                : `${BASE_HOST}/${product.image}`
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = getPlaceholderDataUrl("No Image", 400, 400);
            }}
          />
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Stok Habis
            </span>
          </div>
        )}
        {/* Stock Badge */}
        {!isOutOfStock && stockAmount > 0 && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${isLowStock
            ? "bg-orange-500 text-white"
            : "bg-green-500 text-white"
            }`}>
            {isLowStock ? `Sisa ${stockAmount}` : `Stok: ${stockAmount}`}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-white mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-orange-600 dark:text-orange-400 font-bold text-sm">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
            {product.category && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {product.category}
              </p>
            )}
          </div>

          {/* Dual Buttons: Buy Now + Add to Cart */}
          <div className="flex gap-1">
            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`p-2 rounded-full transition-all ${!isOutOfStock
                ? "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              title={!isOutOfStock ? "Beli Sekarang" : "Stok habis"}
            >
              <CreditCard className="w-4 h-4" />
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2 rounded-full transition-all ${!isOutOfStock
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              title={!isOutOfStock ? "Tambah ke keranjang" : "Stok habis"}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Store Button */}
        {businessId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/umkm/${businessId}`);
            }}
            className="w-full mt-3 py-2 px-3 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Store className="w-3 h-3" />
            Lihat Toko
          </button>
        )}
      </div>
    </div>
  );
}
