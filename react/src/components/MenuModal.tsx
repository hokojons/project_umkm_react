import { UMKMBusiness, Product } from "../types";
import {
  X,
  Star,
  User,
  ShoppingCart,
  Plus,
  MessageCircle,
  Phone,
  Mail,
  Instagram,
} from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import ProductDetailModal from "./ProductDetailModal";

interface MenuModalProps {
  stand: UMKMBusiness | null;
  onClose: () => void;
}

export function MenuModal({ stand, onClose }: MenuModalProps) {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!stand) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Image */}
        <div className="relative h-48 md:h-64">
          <img
            src={stand.image}
            alt={stand.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full p-2 transition-colors text-gray-900 dark:text-gray-100"
          >
            <X className="size-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="mb-2">{stand.name}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <User className="size-4" />
                <span className="text-sm">{stand.owner}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                {stand.category}
              </div>
              {stand.whatsapp && (
                <a
                  href={`https://wa.me/${stand.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full text-sm transition-colors"
                  title="Chat WhatsApp"
                >
                  <MessageCircle className="size-4" />
                  <span className="hidden sm:inline">WA</span>
                </a>
              )}
              {stand.instagram && (
                <a
                  href={`https://instagram.com/${stand.instagram.replace(
                    "@",
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-3 py-1 rounded-full text-sm transition-colors"
                  title="Kunjungi Instagram"
                >
                  <Instagram className="size-4" />
                  <span className="hidden sm:inline">IG</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)] md:max-h-[calc(90vh-20rem)]">
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300">
              {stand.description}
            </p>
          </div>

          {/* Contact Section */}
          {(stand.whatsapp ||
            stand.phone ||
            stand.email ||
            stand.instagram) && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="mb-3 text-green-900 dark:text-green-100">
                  Hubungi Penjual
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stand.whatsapp && (
                    <a
                      href={`https://wa.me/${stand.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <MessageCircle className="size-4" />
                      <span className="text-sm">WhatsApp</span>
                    </a>
                  )}
                  {stand.phone && (
                    <a
                      href={`tel:${stand.phone}`}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Phone className="size-4" />
                      <span className="text-sm">Telepon</span>
                    </a>
                  )}
                  {stand.email && (
                    <a
                      href={`mailto:${stand.email}`}
                      className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Mail className="size-4" />
                      <span className="text-sm">Email</span>
                    </a>
                  )}
                  {stand.instagram && (
                    <a
                      href={`https://instagram.com/${stand.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Instagram className="size-4" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            )}

          {/* About Me Section */}
          {stand.about && (
            <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
              <h3 className="mb-2 text-indigo-900 dark:text-indigo-100">
                Tentang Pemilik
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                {stand.about}
              </p>
            </div>
          )}

          <h3 className="mb-4 dark:text-gray-100">Produk</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(stand.products || []).map((item: Product) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  console.log("Product clicked:", item);
                  setSelectedProduct(item);
                }}
                className="flex flex-col bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-all overflow-hidden group cursor-pointer"
              >
                {/* Image */}
                {item.image && (
                  <div className="w-full h-40 overflow-hidden relative">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Quick Add Button on Image Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item, stand.name, stand.id, stand.whatsapp);
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <div className="bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 rounded-full p-3 hover:bg-indigo-600 hover:text-white transition-colors">
                        <Plus className="size-6" />
                      </div>
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="mb-1 dark:text-gray-100">{item.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 flex-1">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded text-xs">
                      {getCategoryLabel(item.category)}
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item, stand.name, stand.id, stand.whatsapp);
                    }}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="size-4" />
                    <span className="text-sm">Tambah ke Keranjang</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

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
            images: selectedProduct.images,
            all_images: selectedProduct.all_images,
            description: selectedProduct.description,
            stock: selectedProduct.stock,
            variant_types: selectedProduct.variant_types,
            seller: {
              name: stand.name,
              whatsapp: stand.whatsapp,
              instagram: stand.instagram,
            },
          }}
          onAddToCart={(productId, quantity, selectedVariants) => {
            const productWithVariants = {
              ...selectedProduct,
              selectedVariants,
            };
            for (let i = 0; i < quantity; i++) {
              addToCart(productWithVariants, stand.name, stand.id, stand.whatsapp);
            }
            setSelectedProduct(null);
          }}
        />
      )}
    </motion.div>
  );
}
