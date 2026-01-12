import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { UMKMDetailModal } from "../components/UMKMDetailModal";
import { FoodStand, Product } from "../types";
import { foodStands } from "../data/stands";

interface ProductWithStand extends Product {
  stand: FoodStand;
}

export function ProductsPage() {
  const [selectedStand, setSelectedStand] = useState<FoodStand | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<ProductWithStand[]>([]);
  const [stands, setStands] = useState<FoodStand[]>(foodStands);

  // Dynamic categories based on available products
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ].filter((cat) => {
    if (cat === "All") return true;
    return products.some((p) => p.category === cat);
  });

  // Load businesses from API and flatten products
  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/umkm");
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const apiStands: FoodStand[] = data.data.map((umkm: any) => {
          const products =
            umkm.products?.map((product: any) => {
              // Handle product image URL
              let productImage = "/api/placeholder/400/300";
              if (product.gambar) {
                if (product.gambar.startsWith('http://') || product.gambar.startsWith('https://')) {
                  productImage = product.gambar;
                } else {
                  productImage = `http://localhost:8000/${product.gambar}`;
                }
              }

              return {
                id: String(product.id),
                name: product.nama_produk,
                description: product.deskripsi,
                price: parseFloat(product.harga),
                image: productImage,
                category: product.kategori || umkm.kategori || "Lainnya",
                available: product.stok > 0,
              };
            }) || [];

          return {
            id: String(umkm.id),
            name: umkm.nama_toko, // Fixed: was nama_bisnis
            description: umkm.deskripsi || "Produk berkualitas dari UMKM lokal",
            category: umkm.category?.nama_kategori || "Lainnya",
            rating: parseFloat(umkm.rating) || 4.5,
            image: umkm.foto_toko // Fixed: was foto_profil
              ? (umkm.foto_toko.startsWith('http://') || umkm.foto_toko.startsWith('https://')
                ? umkm.foto_toko
                : `http://localhost:8000/${umkm.foto_toko}`)
              : "/api/placeholder/400/300",
            menu: products,
            isActive: umkm.status === "active",
            owner: umkm.nama_pemilik,
            whatsapp: umkm.whatsapp,
            instagram: umkm.instagram,
          };
        });

        const activeStands = apiStands.filter((stand) => stand.isActive);
        setStands(activeStands);

        // Flatten products from all stands
        const allProducts: ProductWithStand[] = [];
        activeStands.forEach((stand) => {
          stand.menu.forEach((product) => {
            allProducts.push({
              ...product,
              stand: stand,
            });
          });
        });
        setProducts(allProducts);
      }
    } catch (error) {
      console.error("Error loading businesses:", error);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.stand.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Produk UMKM
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Temukan produk berkualitas dari UMKM lokal
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari produk atau toko..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === category
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          Menampilkan {filteredProducts.length} produk
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewStore={() => setSelectedStand(product.stand)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl font-semibold">Tidak ada produk ditemukan</p>
              <p className="mt-2">
                Coba ubah kata kunci pencarian atau filter kategori
              </p>
            </div>
          </div>
        )}
      </div>

      {/* UMKM Detail Modal - Shows store info and all products */}
      {selectedStand && (
        <UMKMDetailModal
          umkm={selectedStand}
          onClose={() => setSelectedStand(null)}
        />
      )}
    </div>
  );
}
