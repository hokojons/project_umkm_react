/*
 * Product Detail Modal - Opens when clicking a product
 * Supports both light and dark theme
 */

import React, { useState } from "react";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
    seller?: {
      name: string;
      whatsapp?: string;
      instagram?: string;
    };
  };
  onAddToCart?: (productId: string, quantity: number) => void;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id, quantity);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition text-gray-600 dark:text-gray-300"
        >
          <X size={20} />
        </button>

        {/* Banner/Header Image */}
        {product.image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30 dark:to-gray-800/50" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Section */}
          {(product.seller?.whatsapp || product.seller?.instagram) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Hubungi Penjual
              </h3>
              <div className="flex gap-3">
                {product.seller?.whatsapp && (
                  <a
                    href={`https://wa.me/${product.seller.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    📱 WhatsApp
                  </a>
                )}
                {product.seller?.instagram && (
                  <a
                    href={`https://instagram.com/${product.seller.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    📷 Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Product Image */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex justify-center">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-48 h-48 object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Produk</h3>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm">{product.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Harga</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Rp {product.price.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Jumlah</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-gray-700 dark:text-gray-200 transition"
              >
                <Minus size={16} />
              </button>
              <span className="text-gray-900 dark:text-white font-bold w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-gray-700 dark:text-gray-200 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
          >
            <ShoppingCart size={20} />
            Tambah ke keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
