import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit,
  Trash2,
  Store as StoreIcon,
  Package,
  MessageCircle,
  Instagram,
  Upload,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { RejectionCommentsModal } from "./RejectionCommentsModal";
import { AddProductModal } from "./AddProductModal";
import { getImageUrl, getPlaceholderDataUrl, handleImageError } from "../utils/imageHelpers";


interface UMKMDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdate?: () => void;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  businessId: string;
  ownerId?: string;
  status?: string; // NEW: product status (pending, active, rejected)
}

interface Business {
  id: string;
  name: string;
  owner: string;
  description: string;
  image: string;
  category: string;
  ownerId?: string;
  userId?: string;
  whatsapp?: string;
  instagram?: string;
  about?: string;
}

export function UMKMDashboard({
  isOpen,
  onClose,
  onDataUpdate,
}: UMKMDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"businesses" | "products">(
    "businesses"
  );
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // NEW: Rejection comments and add product modals
  const [showRejectionComments, setShowRejectionComments] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [hasApprovedUmkm, setHasApprovedUmkm] = useState(false);

  useEffect(() => {
    console.log('[UMKMDashboard] useEffect triggered', { isOpen, role: user?.role, activeTab });
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, activeTab, user]);

  const fetchData = () => {
    if (!user) return;

    console.log('[UMKMDashboard] Fetching data for user:', user);

    try {
      if (activeTab === "businesses") {
        // Fetch user's own UMKM (all statuses: pending, active, rejected)
        fetch("http://localhost:8000/api/umkm/my-umkm", {
          headers: {
            "X-User-ID": user.id,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('[UMKMDashboard] Received data:', data);
            if (data.success && Array.isArray(data.data)) {
              const myBusinesses = data.data.map((umkm: any) => ({
                id: String(umkm.id),
                name: umkm.nama_toko,
                owner: umkm.nama_pemilik,
                description: umkm.deskripsi,
                image: getImageUrl(umkm.foto_toko, "http://localhost:8000", getPlaceholderDataUrl("No Image")),
                category: umkm.category?.nama_kategori || "Lainnya",
                userId: String(umkm.user_id),
                ownerId: String(umkm.user_id),
                whatsapp: umkm.whatsapp,
                instagram: umkm.instagram,
                about: umkm.about_me,
                status: umkm.status,
              }));
              setBusinesses(myBusinesses);

              // Check if user has approved UMKM
              const hasApproved = myBusinesses.some(
                (b: any) => b.status === 'active'
              );
              setHasApprovedUmkm(hasApproved);
            } else {
              setBusinesses([]);
              setHasApprovedUmkm(false);
            }
          })
          .catch((error) => {
            console.error("Error fetching businesses:", error);
            setBusinesses([]);
            setHasApprovedUmkm(false);
          });
      } else {
        // Fetch products from user's UMKM
        fetch("http://localhost:8000/api/umkm/my-umkm", {
          headers: {
            "X-User-ID": user.id,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              // Get all products from user's businesses
              const myProducts: Product[] = [];
              data.data.forEach((umkm: any) => {
                if (umkm.products && Array.isArray(umkm.products)) {
                  umkm.products.forEach((product: any) => {
                    // Use approval_status if available, otherwise fallback to status
                    const productStatus = product.approval_status || product.status || "active";
                    myProducts.push({
                      id: String(product.kodeproduk || product.id),
                      name: product.nama_produk,
                      description: product.deskripsi,
                      price: parseFloat(product.harga),
                      image: getImageUrl(product.gambar, "http://localhost:8000", getPlaceholderDataUrl("No Image")),
                      category: product.kategori || "product",
                      businessId: String(umkm.id),
                      ownerId: String(umkm.user_id),
                      status: productStatus,
                    });
                  });
                }
              });
              setProducts(myProducts);
            } else {
              setProducts([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching products:", error);
            setProducts([]);
          });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
    }
  };

  const handleDeleteBusiness = (id: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus bisnis ini? Semua produk terkait juga akan dihapus."
      )
    ) {
      return;
    }

    try {
      const localBusinesses = localStorage.getItem("pasar_umkm_businesses");
      if (localBusinesses) {
        const allBusinesses = JSON.parse(localBusinesses);
        const updatedBusinesses = allBusinesses.filter(
          (b: Business) => b.id !== id
        );
        localStorage.setItem(
          "pasar_umkm_businesses",
          JSON.stringify(updatedBusinesses)
        );
      }

      // Also delete related products
      const localProducts = localStorage.getItem("pasar_umkm_products");
      if (localProducts) {
        const allProducts = JSON.parse(localProducts);
        const updatedProducts = allProducts.filter(
          (p: Product) => p.businessId !== id
        );
        localStorage.setItem(
          "pasar_umkm_products",
          JSON.stringify(updatedProducts)
        );
      }

      toast.success("Bisnis berhasil dihapus");
      fetchData();
      if (onDataUpdate) onDataUpdate();
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("Gagal menghapus bisnis");
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      return;
    }

    try {
      const localProducts = localStorage.getItem("pasar_umkm_products");
      if (localProducts) {
        const allProducts = JSON.parse(localProducts);
        const updatedProducts = allProducts.filter((p: Product) => p.id !== id);
        localStorage.setItem(
          "pasar_umkm_products",
          JSON.stringify(updatedProducts)
        );
      }

      toast.success("Produk berhasil dihapus");
      fetchData();
      if (onDataUpdate) onDataUpdate();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Gagal menghapus produk");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "business" | "product"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Store the file object directly instead of converting to base64
      if (type === "business" && editingBusiness) {
        setEditingBusiness({
          ...editingBusiness,
          imageFile: file,
          image: URL.createObjectURL(file), // For preview only
        });
      } else if (type === "product" && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          imageFile: file,
          image: URL.createObjectURL(file), // For preview only
        });
      }
      setIsUploading(false);
      toast.success("Gambar siap diupload");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengupload gambar");
      setIsUploading(false);
    }
  };

  const handleUpdateBusiness = async () => {
    if (!editingBusiness || !user) return;

    try {
      const formData = new FormData();
      formData.append("_method", "PUT"); // Laravel method spoofing
      formData.append("nama_toko", editingBusiness.name);
      formData.append("nama_pemilik", editingBusiness.owner);
      formData.append("deskripsi", editingBusiness.description);

      if (editingBusiness.imageFile) {
        console.log(
          "📸 Uploading new image file:",
          editingBusiness.imageFile.name
        );
        formData.append("foto_toko", editingBusiness.imageFile);
      } else {
        console.log("ℹ️ No new image to upload");
      }

      if (editingBusiness.whatsapp) {
        formData.append("whatsapp", editingBusiness.whatsapp);
      }
      if (editingBusiness.instagram) {
        formData.append("instagram", editingBusiness.instagram);
      }
      if (editingBusiness.about) {
        formData.append("about_me", editingBusiness.about);
      }

      console.log("🚀 Sending update to API...");
      const response = await fetch(
        `http://localhost:8000/api/umkm/${editingBusiness.id}`,
        {
          method: "POST", // Changed from PUT to POST for file upload
          headers: {
            "X-User-ID": user.id,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("📥 API Response:", data);

      if (data.success) {
        toast.success("Toko berhasil diperbarui");
        setEditingBusiness(null);
        fetchData();
        if (onDataUpdate) onDataUpdate();
      } else {
        toast.error(data.message || "Gagal memperbarui toko");
      }
    } catch (error) {
      console.error("Error updating business:", error);
      toast.error("Gagal memperbarui toko");
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !user) return;

    try {
      // Check if this is a rejected product being resubmitted
      const isRejected = editingProduct.status === 'rejected' || editingProduct.status === 'inactive';

      console.log('Updating product:', {
        id: editingProduct.id,
        status: editingProduct.status,
        isRejected: isRejected
      });

      const formData = new FormData();
      formData.append("nama_produk", editingProduct.name);
      formData.append("deskripsi", editingProduct.description);
      formData.append("harga", editingProduct.price.toString());
      formData.append("kategori", editingProduct.category);

      if (editingProduct.imageFile) {
        formData.append("gambar", editingProduct.imageFile);
      }

      const endpoint = isRejected
        ? `http://localhost:8000/api/products/${editingProduct.id}/resubmit`
        : `http://localhost:8000/api/umkm/product/${editingProduct.id}`;

      console.log('Using endpoint:', endpoint);

      if (!isRejected) {
        formData.append("_method", "PUT"); // Laravel method spoofing for regular updates
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "X-User-ID": user.id.toString(),
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        toast.success(isRejected
          ? "Produk berhasil dikirim ulang untuk ditinjau admin"
          : "Produk berhasil diperbarui");
        setEditingProduct(null);
        fetchData();
        if (onDataUpdate) onDataUpdate();
      } else {
        toast.error(data.message || "Gagal memperbarui produk");
        console.error('Update failed:', data);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Gagal memperbarui produk");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="mb-1">Dashboard UMKM</h2>
            <p className="text-gray-600 text-sm">Kelola toko dan produk Anda</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("businesses")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === "businesses"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <StoreIcon className="size-5" />
                Toko Saya ({businesses.length})
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === "products"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <Package className="size-5" />
                Produk ({products.length})
              </button>
            </div>

            {/* NEW: Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectionComments(true)}
                className="px-4 py-2 rounded-lg flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <AlertCircle className="size-5" />
                Lihat Komentar Penolakan
              </button>

              {hasApprovedUmkm && (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <Plus className="size-5" />
                  Tambah Produk
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {activeTab === "businesses" ? (
            <div>
              {businesses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <StoreIcon className="size-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    Anda belum memiliki toko yang terdaftar
                  </p>
                  <p className="text-sm text-gray-500">
                    Gunakan menu "Ajukan Toko UMKM" untuk mendaftarkan toko Anda
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        <img
                          src={business.image}
                          alt={business.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="mb-1">{business.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {business.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                              {business.category}
                            </span>
                            {business.whatsapp && (
                              <a
                                href={`https://wa.me/${business.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MessageCircle className="size-3" />
                                WhatsApp
                              </a>
                            )}
                            {business.instagram && (
                              <a
                                href={`https://instagram.com/${business.instagram.replace(
                                  "@",
                                  ""
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded hover:bg-pink-200 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Instagram className="size-3" />
                                Instagram
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setEditingBusiness(business)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBusiness(business.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="size-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    Anda belum memiliki produk yang terdaftar
                  </p>
                  <p className="text-sm text-gray-500">
                    Produk akan muncul di sini setelah toko Anda disetujui oleh
                    admin
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="mb-1">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-2">
                          {product.status === 'pending' ? (
                            <div className="flex-1">
                              <span className="inline-block px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-lg">
                                Menunggu Disetujui Admin
                              </span>
                            </div>
                          ) : product.status === 'rejected' || product.status === 'inactive' ? (
                            <div className="flex-1">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-indigo-600 font-medium">
                                    {formatCurrency(product.price)}
                                  </span>
                                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                                    TERTOLAK
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-indigo-600 font-medium">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                          <div className="flex gap-2">
                            {(product.status === 'rejected' || product.status === 'inactive') ? (
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="px-3 py-1.5 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                                title="Kirim Ulang Produk"
                              >
                                <Edit className="size-4" />
                                Kirim Ulang
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="size-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {product.category}
                          </span>
                          {product.status === 'active' && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              Aktif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Catatan:</strong> Untuk menambah toko atau produk baru,
              gunakan menu "Ajukan Toko UMKM". Setelah disetujui admin, toko dan
              produk Anda akan muncul di marketplace.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Business Modal */}
      {editingBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between z-10 rounded-t-2xl">
              <h2>Edit Toko</h2>
              <button
                onClick={() => setEditingBusiness(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Foto Toko
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={editingBusiness.image}
                    alt={editingBusiness.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <input
                      type="file"
                      id="edit-business-image"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "business")}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="edit-business-image"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <Loader className="size-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          Ganti Foto
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Toko
                </label>
                <input
                  type="text"
                  value={editingBusiness.name}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Pemilik
                </label>
                <input
                  type="text"
                  value={editingBusiness.owner}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      owner: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={editingBusiness.description}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tentang (About Me)
                </label>
                <textarea
                  value={editingBusiness.about || ""}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      about: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Ceritakan tentang perjalanan Anda, visi, misi..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.whatsapp || ""}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        whatsapp: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="628123456789"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 628xxx (tanpa +)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.instagram || ""}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        instagram: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="username_toko"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tanpa simbol @</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingBusiness(null)}
                  className="flex-1 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateBusiness}
                  className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between z-10 rounded-t-2xl">
              <div>
                <h2>
                  {editingProduct.status === 'rejected' || editingProduct.status === 'inactive'
                    ? 'Kirim Ulang Produk'
                    : 'Edit Produk'}
                </h2>
                {(editingProduct.status === 'rejected' || editingProduct.status === 'inactive') && (
                  <p className="text-sm text-orange-600 mt-1">
                    Produk akan dikirim ulang ke admin untuk ditinjau
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Foto Produk
                </label>
                <div className="flex items-center gap-4">
                  {editingProduct.image && (
                    <img
                      src={editingProduct.image}
                      alt={editingProduct.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      id="edit-product-image"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "product")}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="edit-product-image"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <Loader className="size-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          {editingProduct.image ? "Ganti Foto" : "Upload Foto"}
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kategori
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="product">Produk</option>
                    <option value="food">Makanan</option>
                    <option value="accessory">Aksesoris</option>
                    <option value="craft">Kerajinan</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateProduct}
                  className={`flex-1 px-6 py-2.5 text-white rounded-lg font-medium transition-colors ${editingProduct.status === 'rejected' || editingProduct.status === 'inactive'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  {editingProduct.status === 'rejected' || editingProduct.status === 'inactive'
                    ? 'Kirim Ulang ke Admin'
                    : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Rejection Comments Modal */}
      <RejectionCommentsModal
        isOpen={showRejectionComments}
        onClose={() => setShowRejectionComments(false)}
      />

      {/* NEW: Add Product Modal */}
      <AddProductModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onSuccess={() => {
          fetchData();
          if (onDataUpdate) onDataUpdate();
        }}
      />
    </div>
  );
}
