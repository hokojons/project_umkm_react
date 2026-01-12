import { ShoppingCart, Store } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onViewStore?: () => void;
}

export function ProductCard({ product, onViewStore }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = localStorage.getItem("pasar_umkm_current_user");
    
    if (!currentUser) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    addToCart(product);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div
      onClick={onViewStore}
      className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-200 dark:border-gray-600 hover:scale-105"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-600 overflow-hidden">
        <img
          src={
            product.image.startsWith('http://') || product.image.startsWith('https://')
              ? product.image
              : `http://localhost:8000/${product.image}`
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/api/placeholder/400/400";
          }}
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Stok Habis
            </span>
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

          <button
            onClick={handleAddToCart}
            disabled={!product.available}
            className={`p-2 rounded-full transition-all ${
              product.available
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
            title={product.available ? "Tambah ke keranjang" : "Stok habis"}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* View Store Button */}
        {onViewStore && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewStore();
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
