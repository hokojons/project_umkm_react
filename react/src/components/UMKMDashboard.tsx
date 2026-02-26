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
  Gift,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { RejectionCommentsModal } from "./RejectionCommentsModal";
import { AddProductModal } from "./AddProductModal";
import { EditProductModal } from "./EditProductModal";
import { PackageSubmissionModal } from "./PackageSubmissionModal";
import { getImageUrl, getPlaceholderDataUrl, handleImageError } from "../utils/imageHelpers";
import { API_BASE_URL, BASE_HOST } from "../config/api";


interface UMKMDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdate?: () => void;
  asPage?: boolean; // If true, render as page content instead of modal
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stok?: number;
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
  // Bank account info
  namaBank?: string;
  noRekening?: string;
  atasNama?: string;
  menyediakanJasaKirim?: boolean;
  imageFile?: File;
}

export function UMKMDashboard({
  isOpen,
  onClose,
  onDataUpdate,
  asPage = false,
}: UMKMDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"businesses" | "products" | "packages">(
    "businesses"
  );
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [myPackages, setMyPackages] = useState<any[]>([]);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // NEW: Rejection comments and add product modals
  const [showRejectionComments, setShowRejectionComments] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPackageSubmission, setShowPackageSubmission] = useState(false);
  const [hasApprovedUmkm, setHasApprovedUmkm] = useState(false);
  const [packageSearchQuery, setPackageSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");

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
        fetch(`${API_BASE_URL}/umkm/my-umkm`, {
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
                image: getImageUrl(umkm.foto_toko, BASE_HOST, getPlaceholderDataUrl("No Image")),
                category: umkm.category?.nama_kategori || "Lainnya",
                userId: String(umkm.user_id),
                ownerId: String(umkm.user_id),
                whatsapp: umkm.whatsapp,
                instagram: umkm.instagram,
                about: umkm.about_me,
                status: umkm.status,
                // Bank account info
                namaBank: umkm.nama_bank,
                noRekening: umkm.no_rekening,
                atasNama: umkm.atas_nama_rekening,
                // Delivery option
                menyediakanJasaKirim: umkm.menyediakan_jasa_kirim ?? false,
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
      } else if (activeTab === "products") {
        // Fetch products from user's UMKM
        fetch(`${API_BASE_URL}/umkm/my-umkm`, {
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
                      stok: product.stok || 0,
                      image: getImageUrl(product.gambar, BASE_HOST, getPlaceholderDataUrl("No Image")),
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
      } else if (activeTab === "packages") {
        // Fetch user's submitted packages
        fetch(`${API_BASE_URL}/gift-packages/my-packages?user_id=${user.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              setMyPackages(data.data);
            } else {
              setMyPackages([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching packages:", error);
            setMyPackages([]);
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

  const handleUpdatePackage = async () => {
    if (!editingPackage || !user) return;

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", editingPackage.name);
      formData.append("description", editingPackage.description);
      formData.append("price", editingPackage.price.toString());
      formData.append("stok", (editingPackage.stok || 0).toString());

      if (editingPackage.tanggal_mulai) {
        formData.append("tanggal_mulai", editingPackage.tanggal_mulai);
      }
      if (editingPackage.tanggal_akhir) {
        formData.append("tanggal_akhir", editingPackage.tanggal_akhir);
      }

      if (editingPackage.imageFile) {
        formData.append("image", editingPackage.imageFile);
      }

      const response = await fetch(
        `${API_BASE_URL}/gift-packages/${editingPackage.id}`,
        {
          method: "POST",
          headers: {
            "X-User-ID": user.id,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Paket berhasil diperbarui");
        setEditingPackage(null);
        fetchData();
        if (onDataUpdate) onDataUpdate();
      } else {
        toast.error(data.message || "Gagal memperbarui paket");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Gagal memperbarui paket");
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/gift-packages/${id}`,
        {
          method: "DELETE",
          headers: {
            "X-User-ID": user?.id || "",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Paket berhasil dihapus");
        fetchData();
        if (onDataUpdate) onDataUpdate();
      } else {
        toast.error(data.message || "Gagal menghapus paket");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Gagal menghapus paket");
    }
  };

  const handlePackageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    if (editingPackage) {
      setEditingPackage({
        ...editingPackage,
        imageFile: file,
        image: URL.createObjectURL(file),
      });
      toast.success("Gambar siap diupload");
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "business" | "product"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
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
      // Bank account info
      if (editingBusiness.namaBank) {
        formData.append("nama_bank", editingBusiness.namaBank);
      }
      if (editingBusiness.noRekening) {
        formData.append("no_rekening", editingBusiness.noRekening);
      }
      if (editingBusiness.atasNama) {
        formData.append("atas_nama_rekening", editingBusiness.atasNama);
      }
      // Delivery option
      formData.append("menyediakan_jasa_kirim", editingBusiness.menyediakanJasaKirim ? "1" : "0");

      console.log("🚀 Sending update to API...");
      const response = await fetch(
        `${API_BASE_URL}/umkm/${editingBusiness.id}`,
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
      formData.append("stok", (editingProduct.stok || 0).toString());
      formData.append("kategori", editingProduct.category);

      if (editingProduct.imageFile) {
        formData.append("gambar", editingProduct.imageFile);
      }

      const endpoint = isRejected
        ? `${API_BASE_URL}/products/${editingProduct.id}/resubmit`
        : `${API_BASE_URL}/products/${editingProduct.id}`;

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

  // Page mode: render without modal overlay
  if (asPage) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="border-b dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard UMKM</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Kelola toko dan produk Anda</p>
          </div>

          <div className="p-3 sm:p-6">
            {/* Tabs */}
            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
              {/* Tab Buttons */}
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar">
                <button
                  onClick={() => setActiveTab("businesses")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${activeTab === "businesses"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  <StoreIcon className="size-3.5 sm:size-4" />
                  Toko ({businesses.length})
                </button>
                <button
                  onClick={() => setActiveTab("products")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${activeTab === "products"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  <Package className="size-3.5 sm:size-4" />
                  Produk ({products.length})
                </button>
                <button
                  onClick={() => setActiveTab("packages")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${activeTab === "packages"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  <Gift className="size-3.5 sm:size-4" />
                  Paket ({myPackages.length})
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                <button
                  onClick={() => setShowRejectionComments(true)}
                  className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs sm:text-sm border border-red-200 dark:border-red-800"
                >
                  <AlertCircle className="size-3.5 sm:size-4" />
                  Penolakan
                </button>

                {hasApprovedUmkm && (
                  <>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors text-xs sm:text-sm"
                    >
                      <Plus className="size-3.5 sm:size-4" />
                      Produk
                    </button>
                    <button
                      onClick={() => setShowPackageSubmission(true)}
                      className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 bg-purple-600 text-white hover:bg-purple-700 transition-colors text-xs sm:text-sm"
                    >
                      <Gift className="size-3.5 sm:size-4" />
                      Paket Spesial
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            {activeTab === "businesses" ? (
              <div>
                {businesses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <StoreIcon className="size-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Anda belum memiliki toko yang terdaftar
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Gunakan menu "Ajukan Toko UMKM" untuk mendaftarkan toko Anda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {businesses.map((business) => (
                      <div
                        key={business.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 sm:p-6 bg-white dark:bg-gray-700"
                      >
                        {/* Store Header with Image */}
                        <div className="flex flex-row gap-3 sm:gap-6 mb-3 sm:mb-6">
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <img
                                src={editingBusiness?.id === business.id ? editingBusiness.image : business.image}
                                alt={business.name}
                                className="w-16 h-16 sm:w-32 sm:h-32 object-cover rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-600"
                              />
                              {editingBusiness?.id === business.id && (
                                <label className="absolute -bottom-1 -right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                                  <Upload className="size-3 sm:size-4" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, "business")}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-2 sm:space-y-4">
                            {/* Store Name */}
                            <div>
                              <label className="block text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                                Nama Toko
                              </label>
                              {editingBusiness?.id === business.id ? (
                                <input
                                  type="text"
                                  value={editingBusiness.name}
                                  onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                                  className="w-full px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                              ) : (
                                <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{business.name}</p>
                              )}
                            </div>

                            {/* Owner Name */}
                            <div>
                              <label className="block text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                                Pemilik
                              </label>
                              {editingBusiness?.id === business.id ? (
                                <input
                                  type="text"
                                  value={editingBusiness.owner}
                                  onChange={(e) => setEditingBusiness({ ...editingBusiness, owner: e.target.value })}
                                  className="w-full px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                              ) : (
                                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{business.owner}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mb-3 sm:mb-4">
                          <label className="block text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Deskripsi Toko
                          </label>
                          {editingBusiness?.id === business.id ? (
                            <textarea
                              value={editingBusiness.description}
                              onChange={(e) => setEditingBusiness({ ...editingBusiness, description: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{business.description}</p>
                          )}
                        </div>

                        {/* Contact & Social */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              <MessageCircle className="size-4 inline mr-1" /> WhatsApp
                            </label>
                            {editingBusiness?.id === business.id ? (
                              <input
                                type="text"
                                value={editingBusiness.whatsapp || ""}
                                onChange={(e) => setEditingBusiness({ ...editingBusiness, whatsapp: e.target.value })}
                                placeholder="08123456789"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                              />
                            ) : (
                              <p className="text-gray-700 dark:text-gray-300">{business.whatsapp || "-"}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              <Instagram className="size-4 inline mr-1" /> Instagram
                            </label>
                            {editingBusiness?.id === business.id ? (
                              <input
                                type="text"
                                value={editingBusiness.instagram || ""}
                                onChange={(e) => setEditingBusiness({ ...editingBusiness, instagram: e.target.value })}
                                placeholder="@username"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                              />
                            ) : (
                              <p className="text-gray-700 dark:text-gray-300">{business.instagram || "-"}</p>
                            )}
                          </div>
                        </div>

                        {/* Bank Account Info */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            💳 Informasi Rekening Bank
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nama Bank
                              </label>
                              {editingBusiness?.id === business.id ? (
                                <input
                                  type="text"
                                  value={editingBusiness.namaBank || ""}
                                  onChange={(e) => setEditingBusiness({ ...editingBusiness, namaBank: e.target.value })}
                                  placeholder="BCA, BNI, Mandiri, dll"
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                              ) : (
                                <p className="text-gray-700 dark:text-gray-300">{business.namaBank || "-"}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                No. Rekening
                              </label>
                              {editingBusiness?.id === business.id ? (
                                <input
                                  type="text"
                                  value={editingBusiness.noRekening || ""}
                                  onChange={(e) => setEditingBusiness({ ...editingBusiness, noRekening: e.target.value })}
                                  placeholder="1234567890"
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                              ) : (
                                <p className="text-gray-700 dark:text-gray-300">{business.noRekening || "-"}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Atas Nama
                              </label>
                              {editingBusiness?.id === business.id ? (
                                <input
                                  type="text"
                                  value={editingBusiness.atasNama || ""}
                                  onChange={(e) => setEditingBusiness({ ...editingBusiness, atasNama: e.target.value })}
                                  placeholder="Nama pemilik rekening"
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                              ) : (
                                <p className="text-gray-700 dark:text-gray-300">{business.atasNama || "-"}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* About / Bio */}
                        <div className="mb-3 sm:mb-4">
                          <label className="block text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Tentang Toko
                          </label>
                          {editingBusiness?.id === business.id ? (
                            <textarea
                              value={editingBusiness.about || ""}
                              onChange={(e) => setEditingBusiness({ ...editingBusiness, about: e.target.value })}
                              rows={3}
                              placeholder="Ceritakan tentang toko Anda..."
                              className="w-full px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{business.about || "Belum ada deskripsi"}</p>
                          )}
                        </div>

                        {/* Delivery Option */}
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <label className="flex items-center gap-3 cursor-pointer">
                            {editingBusiness?.id === business.id ? (
                              <input
                                type="checkbox"
                                checked={editingBusiness.menyediakanJasaKirim || false}
                                onChange={(e) =>
                                  setEditingBusiness({
                                    ...editingBusiness,
                                    menyediakanJasaKirim: e.target.checked,
                                  })
                                }
                                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            ) : (
                              <span className={`w-5 h-5 rounded flex items-center justify-center ${business.menyediakanJasaKirim ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                {business.menyediakanJasaKirim ? '✓' : '✕'}
                              </span>
                            )}
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                🚚 Menyediakan Jasa Pengiriman
                              </span>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {business.menyediakanJasaKirim || editingBusiness?.menyediakanJasaKirim
                                  ? "Toko ini bisa mengirim produk ke lokasi pembeli"
                                  : "Pembeli harus ambil sendiri di lokasi toko"}
                              </p>
                            </div>
                          </label>
                        </div>

                        {/* Category Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm rounded-full">
                            {business.category}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                          {editingBusiness?.id === business.id ? (
                            <>
                              <button
                                onClick={() => setEditingBusiness(null)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                Batal
                              </button>
                              <button
                                onClick={handleUpdateBusiness}
                                disabled={isUploading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader className="size-4 animate-spin" />
                                    Menyimpan...
                                  </>
                                ) : (
                                  "Simpan Perubahan"
                                )}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingBusiness(business)}
                                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2"
                              >
                                <Edit className="size-4" />
                                Edit Toko
                              </button>
                              <button
                                onClick={() => handleDeleteBusiness(business.id)}
                                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="size-4" />
                                Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === "products" ? (
              <div>
                {/* Search Box */}
                {products.length > 0 && (
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Cari produk berdasarkan nama..."
                      className="w-full md:w-80 px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <svg className="absolute left-3 top-2.5 size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}

                {products.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Package className="size-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Anda belum memiliki produk yang terdaftar
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Produk akan muncul di sini setelah toko Anda disetujui oleh
                      admin
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    {products
                      .filter((product) =>
                        productSearchQuery === '' ||
                        product.name?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                        product.description?.toLowerCase().includes(productSearchQuery.toLowerCase())
                      )
                      .map((product) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
                        >
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-32 sm:h-48 object-cover"
                            />
                          )}
                          <div className="p-2.5 sm:p-4">
                            {/* Product Name */}
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 text-xs sm:text-base">
                              {product.name}
                            </h4>

                            {/* Description */}
                            <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2 hidden sm:block">
                              {product.description}
                            </p>

                            {/* Price & Stock */}
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                              <span className="text-xs sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(product.price)}
                              </span>
                              <span className={`text-[10px] sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${(product.stok || 0) > 0
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                }`}>
                                Stok: {product.stok || 0}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                                {product.category}
                              </span>
                              {product.status === 'pending' && (
                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded flex items-center gap-1">
                                  <Clock className="size-3" />
                                  Menunggu
                                </span>
                              )}
                              {product.status === 'active' && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded flex items-center gap-1">
                                  <CheckCircle className="size-3" />
                                  Aktif
                                </span>
                              )}
                              {(product.status === 'rejected' || product.status === 'inactive') && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded flex items-center gap-1">
                                  <XCircle className="size-3" />
                                  Ditolak
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                              {(product.status === 'rejected' || product.status === 'inactive') ? (
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center justify-center gap-1"
                                >
                                  <Edit className="size-4" />
                                  Kirim Ulang
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingProduct(product)}
                                    className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm flex items-center justify-center gap-1"
                                  >
                                    <Edit className="size-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm flex items-center justify-center gap-1"
                                  >
                                    <Trash2 className="size-4" />
                                    Hapus
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : activeTab === "packages" ? (
              <div>
                {/* Search Box */}
                {myPackages.length > 0 && (
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={packageSearchQuery}
                      onChange={(e) => setPackageSearchQuery(e.target.value)}
                      placeholder="Cari paket berdasarkan nama..."
                      className="w-full md:w-80 px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <svg className="absolute left-3 top-2.5 size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}

                {myPackages.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Gift className="size-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Anda belum mengajukan paket spesial.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Ajukan paket spesial untuk menarik lebih banyak pembeli!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myPackages
                      .filter((pkg) =>
                        packageSearchQuery === '' ||
                        pkg.name?.toLowerCase().includes(packageSearchQuery.toLowerCase()) ||
                        pkg.description?.toLowerCase().includes(packageSearchQuery.toLowerCase())
                      )
                      .map((pkg) => (
                        <div
                          key={pkg.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
                        >
                          {pkg.image && (
                            <img
                              src={getImageUrl(pkg.image, BASE_HOST, getPlaceholderDataUrl("No Image"))}
                              alt={pkg.name}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="mb-1 text-gray-900 dark:text-white">{pkg.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {pkg.description}
                            </p>
                            <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                              {formatCurrency(pkg.price)}
                            </p>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {pkg.status === 'pending' && (
                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full flex items-center gap-1">
                                  <Clock className="size-3" /> Menunggu
                                </span>
                              )}
                              {pkg.status === 'active' && pkg.is_expired && (
                                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full flex items-center gap-1">
                                  <XCircle className="size-3" /> Kadaluarsa
                                </span>
                              )}
                              {pkg.status === 'active' && !pkg.is_expired && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                                  <CheckCircle className="size-3" /> Aktif
                                </span>
                              )}
                              {pkg.status === 'rejected' && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full flex items-center gap-1">
                                  <XCircle className="size-3" /> Ditolak
                                </span>
                              )}
                            </div>
                            {(pkg.tanggal_mulai || pkg.tanggal_akhir) && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                📅 {pkg.tanggal_mulai ? new Date(pkg.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'} - {pkg.tanggal_akhir ? new Date(pkg.tanggal_akhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingPackage(pkg)}
                                className="flex-1 px-3 py-2 text-sm rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1"
                                title="Edit Paket"
                              >
                                <Edit className="size-4" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="flex-1 px-3 py-2 text-sm rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-1"
                                title="Hapus Paket"
                              >
                                <Trash2 className="size-4" /> Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Edit Product Modal */}
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            fetchData();
            if (onDataUpdate) onDataUpdate();
          }}
        />

        {/* Rejection Comments Modal */}
        <RejectionCommentsModal
          isOpen={showRejectionComments}
          onClose={() => setShowRejectionComments(false)}
        />

        {/* Add Product Modal */}
        <AddProductModal
          isOpen={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onSuccess={() => {
            fetchData();
            if (onDataUpdate) onDataUpdate();
          }}
        />

        {/* Package Submission Modal */}
        <PackageSubmissionModal
          isOpen={showPackageSubmission}
          onClose={() => setShowPackageSubmission(false)}
          onSuccess={() => {
            fetchData();
            if (onDataUpdate) onDataUpdate();
          }}
        />

        {/* Edit Package Modal */}
        {editingPackage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between z-10 rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Paket
                </h2>
                <button
                  onClick={() => setEditingPackage(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Foto Paket
                  </label>
                  <div className="flex items-center gap-4">
                    {editingPackage.image && (
                      <img
                        src={getImageUrl(editingPackage.image, BASE_HOST, getPlaceholderDataUrl("No Image"))}
                        alt={editingPackage.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
                        <Upload className="size-4" />
                        {editingPackage.image ? "Ganti Foto" : "Upload Foto"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePackageImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Paket
                  </label>
                  <input
                    type="text"
                    value={editingPackage.name || ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={editingPackage.description || ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={editingPackage.price || 0}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={editingPackage.tanggal_mulai || ""}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          tanggal_mulai: e.target.value || null,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={editingPackage.tanggal_akhir || ""}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          tanggal_akhir: e.target.value || null,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                  Kosongkan jika paket tidak memiliki batas waktu
                </p>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditingPackage(null)}
                    className="flex-1 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdatePackage}
                    className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 sm:p-6 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="mb-1 text-gray-900 dark:text-white">Dashboard UMKM</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Kelola toko dan produk Anda</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="p-3 sm:p-6">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-2 mb-6 sm:justify-between sm:items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("businesses")}
                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors text-sm sm:text-base ${activeTab === "businesses"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                <StoreIcon className="size-4 sm:size-5" />
                Toko Saya ({businesses.length})
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors text-sm sm:text-base ${activeTab === "products"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                <Package className="size-4 sm:size-5" />
                Produk ({products.length})
              </button>
              <button
                onClick={() => setActiveTab("packages")}
                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors text-sm sm:text-base ${activeTab === "packages"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                <Gift className="size-4 sm:size-5" />
                Paket Saya ({myPackages.length})
              </button>
            </div>

            {/* NEW: Action Buttons */}
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => setShowRejectionComments(true)}
                className="px-4 py-2 rounded-lg flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
              >
                <AlertCircle className="size-4" />
                Lihat Penolakan
              </button>

              {hasApprovedUmkm && (
                <>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus className="size-4" />
                    Tambah Produk
                  </button>
                  <button
                    onClick={() => setShowPackageSubmission(true)}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Gift className="size-4" />
                    Ajukan Paket Spesial
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {activeTab === "businesses" ? (
            <div>
              {businesses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <StoreIcon className="size-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Anda belum memiliki toko yang terdaftar
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Gunakan menu "Ajukan Toko UMKM" untuk mendaftarkan toko Anda
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
                    >
                      <div className="flex gap-4">
                        <img
                          src={business.image}
                          alt={business.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="mb-1 text-gray-900 dark:text-white">{business.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {business.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs rounded">
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
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBusiness(business.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
          ) : activeTab === "products" ? (
            <div>
              {/* Search Box */}
              {products.length > 0 && (
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Cari produk berdasarkan nama..."
                    className="w-full md:w-80 px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <svg className="absolute left-3 top-2.5 size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}

              {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Package className="size-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Anda belum memiliki produk yang terdaftar
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Produk akan muncul di sini setelah toko Anda disetujui oleh
                    admin
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter((product) =>
                      productSearchQuery === '' ||
                      product.name?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      product.description?.toLowerCase().includes(productSearchQuery.toLowerCase())
                    )
                    .map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="mb-1 text-gray-900 dark:text-white">{product.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mb-2">
                            {product.status === 'pending' ? (
                              <div className="flex-1">
                                <span className="inline-block px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-sm font-medium rounded-lg">
                                  Menunggu Disetujui Admin
                                </span>
                              </div>
                            ) : product.status === 'rejected' || product.status === 'inactive' ? (
                              <div className="flex-1">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                      {formatCurrency(product.price)}
                                    </span>
                                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                                      TERTOLAK
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
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
                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="size-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Hapus"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                              {product.category}
                            </span>
                            {product.status === 'active' && (
                              <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
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
          ) : activeTab === "packages" ? (
            <div>
              {/* Search Box */}
              {myPackages.length > 0 && (
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={packageSearchQuery}
                    onChange={(e) => setPackageSearchQuery(e.target.value)}
                    placeholder="Cari paket berdasarkan nama..."
                    className="w-full md:w-80 px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <svg className="absolute left-3 top-2.5 size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}

              {myPackages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Gift className="size-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Anda belum memiliki paket yang diajukan
                  </p>
                  {hasApprovedUmkm && (
                    <button
                      onClick={() => setShowPackageSubmission(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
                    >
                      <Plus className="size-4" />
                      Ajukan Paket Pertama
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myPackages
                    .filter((pkg) =>
                      packageSearchQuery === '' ||
                      pkg.name?.toLowerCase().includes(packageSearchQuery.toLowerCase()) ||
                      pkg.description?.toLowerCase().includes(packageSearchQuery.toLowerCase())
                    )
                    .map((pkg) => (
                      <div
                        key={pkg.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
                      >
                        {pkg.image && (
                          <img
                            src={
                              pkg.image.startsWith('http')
                                ? pkg.image
                                : `${BASE_HOST}/${pkg.image}`
                            }
                            alt={pkg.name}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400";
                            }}
                          />
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-gray-900 dark:text-white flex-1">{pkg.name}</h4>
                            {pkg.status === 'pending' && (
                              <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full flex items-center gap-1">
                                <Clock className="size-3" />
                                Menunggu
                              </span>
                            )}
                            {pkg.status === 'active' && pkg.is_expired && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full flex items-center gap-1">
                                <Clock className="size-3" />
                                Expired
                              </span>
                            )}
                            {pkg.status === 'active' && !pkg.is_expired && pkg.tanggal_akhir && (() => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const endDate = new Date(pkg.tanggal_akhir);
                              endDate.setHours(0, 0, 0, 0);
                              const isLastDay = today.getTime() === endDate.getTime();

                              if (isLastDay) {
                                return (
                                  <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full flex items-center gap-1 animate-pulse font-bold">
                                    <Clock className="size-3" />
                                    HARI TERAKHIR!
                                  </span>
                                );
                              }
                              return (
                                <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                                  <CheckCircle className="size-3" />
                                  Aktif
                                </span>
                              );
                            })()}
                            {pkg.status === 'active' && !pkg.is_expired && !pkg.tanggal_akhir && (
                              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                                <CheckCircle className="size-3" />
                                Aktif
                              </span>
                            )}
                            {pkg.status === 'rejected' && (
                              <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full flex items-center gap-1">
                                <XCircle className="size-3" />
                                Ditolak
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {pkg.description}
                          </p>
                          <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                            {formatCurrency(pkg.price)}
                          </p>
                          {pkg.status === 'rejected' && pkg.alasan_penolakan && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mt-2">
                              <p className="text-xs text-red-700 dark:text-red-300">
                                <strong>Alasan:</strong> {pkg.alasan_penolakan}
                              </p>
                            </div>
                          )}
                          {(pkg.tanggal_mulai || pkg.tanggal_akhir) && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                📅 {pkg.tanggal_mulai ? new Date(pkg.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'} - {pkg.tanggal_akhir ? new Date(pkg.tanggal_akhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'}
                              </p>
                              {pkg.tanggal_akhir && !pkg.is_expired && (() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const endDate = new Date(pkg.tanggal_akhir);
                                endDate.setHours(0, 0, 0, 0);
                                const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                                if (diffDays <= 3 && diffDays >= 0) {
                                  return (
                                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded animate-pulse">
                                      {diffDays === 0 ? 'HARI TERAKHIR!' : `SEGERA BERAKHIR!`}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-300">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Bank Account Section */}
              <div className="border-t border-green-200 pt-4 mt-2">
                <h4 className="text-sm font-medium mb-3 text-green-800 flex items-center gap-2">
                  💳 Informasi Rekening Bank
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Info rekening akan ditampilkan ke pembeli saat checkout
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nama Bank
                    </label>
                    <input
                      type="text"
                      value={editingBusiness.namaBank || ""}
                      onChange={(e) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          namaBank: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="BCA, BNI, Mandiri..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      No. Rekening
                    </label>
                    <input
                      type="text"
                      value={editingBusiness.noRekening || ""}
                      onChange={(e) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          noRekening: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Atas Nama
                    </label>
                    <input
                      type="text"
                      value={editingBusiness.atasNama || ""}
                      onChange={(e) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          atasNama: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Nama Pemilik Rekening"
                    />
                  </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Stok *
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stok ?? ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stok: e.target.value === "" ? undefined : parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    required
                    placeholder="Masukkan jumlah stok"
                  />
                </div>
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

      {/* NEW: Package Submission Modal */}
      <PackageSubmissionModal
        isOpen={showPackageSubmission}
        onClose={() => setShowPackageSubmission(false)}
        onSuccess={() => {
          fetchData();
          if (onDataUpdate) onDataUpdate();
        }}
      />
    </div>
  );
}
