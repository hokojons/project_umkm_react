import { X, MapPin, Phone, Instagram, Star, Package } from "lucide-react";
import { FoodStand, Product } from "../types";
import { useState } from "react";
import ProductDetailModal from "./ProductDetailModal";
import { useCart } from "../context/CartContext";

interface UMKMDetailModalProps {
  umkm: FoodStand;
  onClose: () => void;
}

export function UMKMDetailModal({ umkm, onClose }: UMKMDetailModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Image */}
        <div className="relative h-64 rounded-t-2xl overflow-hidden">
          <img
            src={umkm.image}
            alt={umkm.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* UMKM Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {umkm.name}
              </h2>
              <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-orange-500 fill-current" />
                <span className="font-semibold text-orange-700 dark:text-orange-400">
                  {umkm.rating}
                </span>
              </div>
            </div>
            
            <div className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
              {umkm.category}
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {umkm.description}
            </p>
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {umkm.owner && (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Pemilik</div>
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {umkm.owner}
                  </div>
                </div>
              </div>
            )}

            {umkm.whatsapp && (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</div>
                  <a
                    href={`https://wa.me/${umkm.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-green-600 dark:text-green-400 hover:underline"
                  >
                    {umkm.whatsapp}
                  </a>
                </div>
              </div>
            )}

            {umkm.instagram && (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg">
                  <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Instagram</div>
                  <a
                    href={`https://instagram.com/${umkm.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                  >
                    {umkm.instagram}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* About */}
          {umkm.about && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                Tentang Kami
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {umkm.about}
              </p>
            </div>
          )}

          {/* Products */}
          {umkm.menu && umkm.menu.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Produk ({umkm.menu.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {umkm.menu.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="aspect-square bg-gray-200 dark:bg-gray-600">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm text-gray-800 dark:text-white mb-1 line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                        Rp {product.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {umkm.menu.length > 8 && (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
                  dan {umkm.menu.length - 8} produk lainnya...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={{
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            image: selectedProduct.image || "",
            description: selectedProduct.description,
            seller: {
              name: umkm.owner || umkm.name,
              whatsapp: umkm.whatsapp,
              instagram: umkm.instagram,
            },
          }}
          onAddToCart={(productId, quantity) => {
            addToCart(selectedProduct, umkm.name, umkm.id);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
