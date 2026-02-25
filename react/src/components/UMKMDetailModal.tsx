import { X, MapPin, Phone, Instagram, Package, ChevronDown, ChevronUp, ShoppingCart, MessageCircle } from "lucide-react";
import { FoodStand, Product } from "../types";
import React, { useState } from "react";
import ProductDetailModal from "./ProductDetailModal";
import { WhatsAppCheckoutModal } from "./WhatsAppCheckoutModal";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface UMKMDetailModalProps {
  umkm: FoodStand;
  onClose: () => void;
}

export function UMKMDetailModal({ umkm, onClose }: UMKMDetailModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // CartContext.addToCart already handles all toast notifications including stock checks
    addToCart(product, umkm.name, umkm.id, umkm.whatsapp);
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.available) {
      toast.error("Produk ini sedang tidak tersedia");
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk melakukan pembelian");
      return;
    }

    // Open payment method selection modal
    setBuyNowProduct(product);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Image */}
        <div className="relative h-64 rounded-t-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500">
          {umkm.image && (
            <img
              src={umkm.image}
              alt={umkm.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Store Name Overlay */}
          <div className="absolute bottom-4 left-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {umkm.name}
            </h2>
            {umkm.owner && (
              <p className="text-white/80 text-sm">oleh {umkm.owner}</p>
            )}
          </div>
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
            <div className="mb-2">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {umkm.name}
              </h2>
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
          {umkm.menu && umkm.menu.length > 0 ? (
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Produk ({umkm.menu.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(showAllProducts ? umkm.menu : umkm.menu.slice(0, 8)).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="relative aspect-square bg-gray-200 dark:bg-gray-600">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${!product.available ? 'opacity-50 grayscale' : ''}`}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1557821552-17105176677c?w=400";
                        }}
                      />
                      {/* Stok Habis Badge */}
                      {!product.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            Stok Habis
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm text-gray-800 dark:text-white mb-1 line-clamp-1">
                        {product.name}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        {/* Stock Badge */}
                        {product.stock !== undefined && product.stock > 0 ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Stok: {product.stock}
                          </span>
                        ) : !product.available && (
                          <span className="text-xs text-red-500 font-medium">
                            Habis
                          </span>
                        )}
                      </div>
                      {/* Action Buttons */}
                      {product.available && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors text-xs font-medium"
                            title="Tambah ke Keranjang"
                          >
                            <ShoppingCart className="size-3" />
                            Keranjang
                          </button>
                          <button
                            onClick={(e) => handleBuyNow(product, e)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs font-medium"
                            title="Beli Langsung via WhatsApp"
                          >
                            <MessageCircle className="size-3" />
                            Beli
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {umkm.menu.length > 8 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAllProducts(!showAllProducts)}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors font-medium"
                  >
                    {showAllProducts ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Tampilkan Lebih Sedikit
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Lihat Semua ({umkm.menu.length - 8} produk lainnya)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <Package className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                Belum ada produk
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Toko ini belum menambahkan produk
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div onClick={(e) => e.stopPropagation()}>
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
                name: umkm.owner || umkm.name,
                whatsapp: umkm.whatsapp,
                instagram: umkm.instagram,
              },
            }}
            onAddToCart={(productId, quantity, selectedVariants) => {
              const productWithVariants = {
                ...selectedProduct,
                selectedVariants,
              };
              addToCart(productWithVariants, umkm.name, umkm.id, umkm.whatsapp);
              setSelectedProduct(null);
            }}
          />
        </div>
      )}

      {/* WhatsApp Checkout Modal for Buy Now */}
      {buyNowProduct && (
        <div onClick={(e) => e.stopPropagation()}>
          <WhatsAppCheckoutModal
            isOpen={!!buyNowProduct}
            onClose={() => setBuyNowProduct(null)}
            umkmName={umkm.name}
            umkmWhatsapp={umkm.whatsapp || ""}
            umkmLocation="Pasar UMKM Digital"
            buyerName={user?.nama_lengkap || user?.name || ""}
            buyerPhone={user?.no_telepon || ""}
            businessId={umkm.id}
            menyediakanJasaKirim={umkm.menyediakanJasaKirim}
            namaBank={umkm.namaBank}
            noRekening={umkm.noRekening}
            atasNama={umkm.atasNama}
            items={[{
              id: buyNowProduct.id,
              name: buyNowProduct.name,
              price: buyNowProduct.price,
              quantity: 1,
              image: buyNowProduct.image || "",
              businessName: umkm.name,
              businessId: umkm.id,
              description: buyNowProduct.description || "",
              category: buyNowProduct.category || "product",
            }]}
            total={buyNowProduct.price}
            onCheckoutComplete={() => {
              setBuyNowProduct(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
