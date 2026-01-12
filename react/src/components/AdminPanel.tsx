import { useState, useEffect } from "react";
import {
  X,
  Store,
  Package,
  FileText,
  UserCog,
  Users,
  Calendar,
  Trash2,
  Check,
  XCircle,
  Filter,
  Search,
  Gift,
  Image,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { foodStands } from "../data/stands";
import { EventManagement } from "./EventManagement";
import { GiftPackageManagement } from "./GiftPackageManagement";
import { ImageEditModal } from "./ImageEditModal";
import { getImageUrl, getPlaceholderDataUrl, handleImageError } from "../utils/imageHelpers";


interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdate: () => void;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  businessId: string;
}

interface Business {
  id: string;
  name: string;
  owner: string;
  description: string;
  image: string;
  category: string;
}

interface Submission {
  id: string;
  productName: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  status: "pending" | "approved" | "rejected";
  userName: string;
  userEmail: string;
  submittedAt: string;
  type: "product" | "business";
  business?: Business;
  products?: Product[];
  userId: string;
}

interface RoleUpgradeRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedRole: "umkm";
  currentRole: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

interface UmkmStore {
  id: number | string; // Can be number or string (kodepengguna like "U002")
  user_id: number;
  nama_toko: string;
  nama_pemilik: string;
  deskripsi?: string;
  alamat_toko?: string; // Added for tumkm compatibility
  foto_toko?: string;
  kategori_id: number | string; // Can be string from tumkm
  whatsapp?: string;
  telepon?: string;
  email?: string;
  instagram?: string;
  status: "pending" | "active" | "inactive" | "rejected";
  created_at?: string | null; // Can be null from tumkm
  updated_at?: string | null;
  user?: { name: string; email?: string | null };
  category?: { nama_kategori: string };
  products?: Array<{
    id: number;
    kodeproduk?: string;
    nama_produk: string;
    deskripsi: string;
    harga: number;
    kategori?: string;
    gambar?: string;
  }>;
}

interface ProductApproval {
  id: number;
  action: 'approve' | 'reject';
  comment: string;
}

export function AdminPanel({ isOpen, onClose, onDataUpdate }: AdminPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | "businesses"
    | "products"
    | "roleRequests"
    | "umkmStores"
    | "pendingProducts"
    | "users"
    | "events"
    | "giftPackages"
  >("businesses");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleUpgradeRequest[]>([]);
  const [umkmStores, setUmkmStores] = useState<UmkmStore[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreDetail, setSelectedStoreDetail] =
    useState<UmkmStore | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // NEW: Product approval states
  const [productApprovals, setProductApprovals] = useState<Map<number, ProductApproval>>(new Map());
  const [umkmComment, setUmkmComment] = useState("");
  const [umkmAction, setUmkmAction] = useState<'approve' | 'reject'>('approve');

  // NEW: Product rejection modal state
  const [rejectingProduct, setRejectingProduct] = useState<any | null>(null);
  const [productRejectionReason, setProductRejectionReason] = useState("");

  // NEW: Bulk selection states
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [bulkRejectionReason, setBulkRejectionReason] = useState("");
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);

  // Image Edit Modal states
  const [imageEditModal, setImageEditModal] = useState<{
    isOpen: boolean;
    itemId: number;
    currentImage: string;
    itemType: 'umkm' | 'product';
    itemName: string;
  } | null>(null);


  useEffect(() => {
    console.log('AdminPanel useEffect triggered', { isOpen, role: user?.role, activeTab });
    if (isOpen && user?.role === "admin") {
      fetchData();
    }
  }, [isOpen, activeTab, user?.role]);

  const fetchData = async () => {
    console.log('fetchData called for tab:', activeTab);
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "businesses") {
        // Fetch active UMKM from database
        fetch("http://localhost:8000/api/umkm")
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              // Transform backend data to frontend format
              const apiBusinesses: Business[] = data.data.map((umkm: any) => ({
                id: String(umkm.id),
                name: umkm.nama_toko,
                owner: umkm.nama_pemilik,
                description: umkm.deskripsi,
                image: getImageUrl(umkm.foto_toko, "http://localhost:8000", getPlaceholderDataUrl("No Image")),
                category: umkm.category?.nama_kategori || "Lainnya",
              }));

              // Load dari foodStands (data default)
              const localBusinesses = foodStands.map((stand) => ({
                id: stand.id,
                name: stand.name,
                owner: stand.owner,
                description: stand.description,
                image: stand.image,
                category: stand.category,
              }));

              // Merge: API businesses + local businesses
              const mergedBusinesses = [...apiBusinesses, ...localBusinesses];
              setBusinesses(mergedBusinesses);
            } else {
              // Fallback to foodStands only
              const localBusinesses = foodStands.map((stand) => ({
                id: stand.id,
                name: stand.name,
                owner: stand.owner,
                description: stand.description,
                image: stand.image,
                category: stand.category,
              }));
              setBusinesses(localBusinesses);
            }
          })
          .catch((error) => {
            console.error("Error fetching businesses:", error);
            // Fallback to foodStands
            const localBusinesses = foodStands.map((stand) => ({
              id: stand.id,
              name: stand.name,
              owner: stand.owner,
              description: stand.description,
              image: stand.image,
              category: stand.category,
            }));
            setBusinesses(localBusinesses);
          });
      } else if (activeTab === "products") {
        // Fetch products from active UMKM
        fetch("http://localhost:8000/api/umkm")
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              // Transform backend products to frontend format
              const apiProducts: Product[] = [];
              data.data.forEach((umkm: any) => {
                if (umkm.products && Array.isArray(umkm.products)) {
                  umkm.products.forEach((product: any) => {
                    apiProducts.push({
                      id: String(product.id),
                      name: product.nama_produk,
                      description: product.deskripsi,
                      price: parseFloat(product.harga),
                      image: getImageUrl(product.gambar, "http://localhost:8000", getPlaceholderDataUrl("No Image")),
                      category: product.kategori || "product",
                      businessId: String(umkm.id),
                    });
                  });
                }
              });

              // Load dari foodStands (data default)
              const localProducts: Product[] = [];
              foodStands.forEach((stand) => {
                stand.products.forEach((product) => {
                  localProducts.push({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    businessId: stand.id,
                  });
                });
              });

              // Merge: API products + local products
              const mergedProducts = [...apiProducts, ...localProducts];
              setProducts(mergedProducts);
            } else {
              // Fallback to foodStands only
              const localProducts: Product[] = [];
              foodStands.forEach((stand) => {
                stand.products.forEach((product) => {
                  localProducts.push({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    businessId: stand.id,
                  });
                });
              });
              setProducts(localProducts);
            }
          })
          .catch((error) => {
            console.error("Error fetching products:", error);
            // Fallback to foodStands
            const localProducts: Product[] = [];
            foodStands.forEach((stand) => {
              stand.products.forEach((product) => {
                localProducts.push({
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  image: product.image,
                  category: product.category,
                  businessId: stand.id,
                });
              });
            });
            setProducts(localProducts);
          });
      } else if (activeTab === "roleRequests") {
        // Fetch pending ROLE UPGRADE requests (customer → umkm_owner)
        fetch("http://localhost:8000/api/role-upgrade/pending")
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              // Data already in correct format from RoleRequestController
              const transformedRequests: RoleUpgradeRequest[] = data.data.map(
                (request: any) => ({
                  id: request.id,
                  userId: request.userId,
                  userEmail: request.userEmail || "N/A",
                  userName: request.userName,
                  requestedRole: request.requestedRole || "umkm",
                  currentRole: request.currentRole || "customer",
                  reason: request.reason || "No reason provided",
                  status: request.status || "pending",
                  submittedAt: request.submittedAt || new Date().toISOString(),
                })
              );
              setRoleRequests(transformedRequests);
            } else {
              setRoleRequests([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching role requests:", error);
            setRoleRequests([]);
          });
      } else if (activeTab === "umkmStores") {
        // Fetch pending UMKM stores from API
        fetch("http://localhost:8000/api/umkm/pending")
          .then((res) => res.json())
          .then((data) => {
            console.log("UMKM Stores API Response:", data);
            if (data.success && Array.isArray(data.data)) {
              console.log("Setting umkmStores:", data.data);
              setUmkmStores(data.data);
            } else {
              console.log("No UMKM stores data or invalid format");
              setUmkmStores([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching UMKM stores:", error);
            setUmkmStores([]);
          });
      } else if (activeTab === "users") {
        // Fetch users from database API
        fetch("http://localhost:8000/api/admin/users")
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              setUsers(data.data);
            } else {
              setUsers([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
            setUsers([]);
          });
      } else if (activeTab === "pendingProducts") {
        // Fetch pending products from API
        fetch("http://localhost:8000/api/products/pending")
          .then((res) => res.json())
          .then((data) => {
            console.log("Pending Products API Response:", data);
            if (data.success && Array.isArray(data.data)) {
              setPendingProducts(data.data);
            } else {
              setPendingProducts([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching pending products:", error);
            setPendingProducts([]);
          });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Terjadi kesalahan saat memuat data");
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus UMKM ini? Semua produk terkait juga akan dihapus.")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/umkm/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus UMKM");
      }

      toast.success("UMKM berhasil dihapus");
      fetchData();
      onDataUpdate();
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const savedProducts = localStorage.getItem("pasar_umkm_products");
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        const updatedProducts = parsedProducts.filter(
          (p: Product) => p.id !== id
        );
        localStorage.setItem(
          "pasar_umkm_products",
          JSON.stringify(updatedProducts)
        );
      }

      toast.success("Produk berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Terjadi kesalahan");
    }
  };

  const handleApproveRoleRequest = async (requestId: string | number) => {
    try {
      // requestId is now the ID from role_upgrade_requests table
      const response = await fetch(
        `http://localhost:8000/api/role-upgrade/${requestId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyetujui request");
      }

      toast.success("Request role berhasil disetujui");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error approving role request:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleRejectRoleRequest = async (requestId: string | number) => {
    try {
      // requestId is now the ID from role_upgrade_requests table

      const response = await fetch(
        `http://localhost:8000/api/role-upgrade/${requestId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menolak request");
      }

      toast.success("Request role berhasil ditolak");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting role request:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleApproveUmkmStore = async (storeId: number | string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/umkm/${storeId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyetujui toko UMKM");
      }

      toast.success("Toko UMKM berhasil disetujui dan aktif");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error approving UMKM store:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleRejectUmkmStore = async (storeId: number | string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/umkm/${storeId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menolak toko UMKM");
      }

      toast.success("Toko UMKM berhasil ditolak");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting UMKM store:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  // NEW: Handle product-level approval
  const handleProductAction = (productId: number, action: 'approve' | 'reject') => {
    const newApprovals = new Map(productApprovals);
    const existing = newApprovals.get(productId) as ProductApproval | undefined;

    newApprovals.set(productId, {
      id: productId,
      action,
      comment: existing?.comment || ''
    });

    setProductApprovals(newApprovals);
  };

  const handleProductComment = (productId: number, comment: string) => {
    const newApprovals = new Map(productApprovals);
    const existing = newApprovals.get(productId) as ProductApproval | undefined;

    newApprovals.set(productId, {
      id: productId,
      action: existing?.action || 'approve',
      comment
    });

    setProductApprovals(newApprovals);
  };

  const handleSubmitApprovalWithProducts = async () => {
    if (!selectedStoreDetail) return;

    try {
      // Build products array from approvals - use id
      const products = selectedStoreDetail.products?.map(product => {
        const approval = productApprovals.get(product.id);
        return {
          id: product.id,
          action: approval?.action || 'approve',
          comment: approval?.comment || ''
        };
      }) || [];

      // Count approved and rejected
      const approvedCount = products.filter(p => p.action === 'approve').length;
      const rejectedCount = products.filter(p => p.action === 'reject').length;

      // Validate: if rejecting all products, confirm with admin
      if (umkmAction === 'approve' && rejectedCount === products.length && products.length > 0) {
        const confirm = window.confirm(
          'Semua produk ditolak. Toko akan otomatis ditolak juga. Lanjutkan?'
        );
        if (!confirm) return;
      }

      const payload = {
        umkm_action: umkmAction,
        umkm_comment: umkmComment,
        products
      };

      const response = await fetch(
        `http://localhost:8000/api/umkm/${selectedStoreDetail.id}/approve-with-products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memproses pengajuan");
      }

      toast.success("Pengajuan berhasil diproses");

      // Reset states
      setProductApprovals(new Map());
      setUmkmComment("");
      setUmkmAction('approve');
      setSelectedStoreDetail(null);

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error processing approval:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah role");
      }

      toast.success("Role berhasil diubah");
      fetchData();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    }
  };

  // NEW: Handle approve/reject individual product
  const handleApproveProduct = async (productId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/products/${productId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyetujui produk");
      }

      toast.success("Produk berhasil disetujui");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error approving product:", error);
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    }
  };

  const handleRejectProduct = async (productId: string) => {
    // Open modal untuk input reason
    const product = pendingProducts.find(p => p.id === productId);
    if (product) {
      setRejectingProduct(product);
      setProductRejectionReason("");
    }
  };

  const handleSubmitProductRejection = async () => {
    if (!rejectingProduct) return;

    // Validate reason length on frontend
    const reason = productRejectionReason.trim();
    if (reason.length < 10) {
      toast.error("Alasan penolakan harus minimal 10 karakter");
      return;
    }

    try {
      const requestData = {
        reason: reason
      };

      console.log('Rejecting product:', {
        productId: rejectingProduct.id,
        requestData: requestData
      });

      const response = await fetch(
        `http://localhost:8000/api/products/${rejectingProduct.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();
      console.log('Rejection response:', data);

      if (!response.ok) {
        console.error('Rejection failed:', data);
        // Display validation errors if available
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Gagal menolak produk");
      }

      toast.success("Produk berhasil ditolak");
      setRejectingProduct(null);
      setProductRejectionReason("");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    }
  };

  // Bulk selection handlers - Products
  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.size === pendingProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(pendingProducts.map(p => p.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Pilih minimal 1 produk untuk disetujui");
      return;
    }

    if (!confirm(`Setujui ${selectedProducts.size} produk yang dipilih?`)) {
      return;
    }

    try {
      const promises = Array.from(selectedProducts).map(productId =>
        fetch(`http://localhost:8000/api/products/${productId}/approve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedProducts.size} produk berhasil disetujui`);
      setSelectedProducts(new Set());
      fetchData();
    } catch (error) {
      console.error("Error bulk approving products:", error);
      toast.error("Gagal menyetujui beberapa produk");
    }
  };

  const handleBulkReject = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Pilih minimal 1 produk untuk ditolak");
      return;
    }

    setShowBulkRejectModal(true);
  };

  const handleSubmitBulkRejection = async () => {
    const reason = bulkRejectionReason.trim();
    if (reason.length < 10) {
      toast.error("Alasan penolakan harus minimal 10 karakter");
      return;
    }

    try {
      const promises = Array.from(selectedProducts).map(productId =>
        fetch(`http://localhost:8000/api/products/${productId}/reject`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedProducts.size} produk berhasil ditolak`);
      setSelectedProducts(new Set());
      setBulkRejectionReason("");
      setShowBulkRejectModal(false);
      fetchData();
    } catch (error) {
      console.error("Error bulk rejecting products:", error);
      toast.error("Gagal menolak beberapa produk");
    }
  };

  // Bulk selection handlers - UMKM Stores
  const [selectedUmkmStores, setSelectedUmkmStores] = useState<Set<number>>(new Set());
  const [showBulkUmkmRejectModal, setShowBulkUmkmRejectModal] = useState(false);
  const [bulkUmkmRejectionReason, setBulkUmkmRejectionReason] = useState("");

  const handleSelectUmkmStore = (storeId: number) => {
    setSelectedUmkmStores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storeId)) {
        newSet.delete(storeId);
      } else {
        newSet.add(storeId);
      }
      return newSet;
    });
  };

  const handleSelectAllUmkmStores = () => {
    const pendingStores = umkmStores.filter(s => s.status === 'pending');
    if (selectedUmkmStores.size === pendingStores.length) {
      setSelectedUmkmStores(new Set());
    } else {
      setSelectedUmkmStores(new Set(pendingStores.map(s => Number(s.id))));
    }
  };

  const handleBulkApproveUmkm = async () => {
    if (selectedUmkmStores.size === 0) {
      toast.error("Pilih minimal 1 toko untuk disetujui");
      return;
    }

    if (!confirm(`Setujui ${selectedUmkmStores.size} toko yang dipilih?`)) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/umkm/bulk-approve', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ store_ids: Array.from(selectedUmkmStores) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyetujui toko");
      }

      toast.success(data.message || `${selectedUmkmStores.size} toko berhasil disetujui`);
      setSelectedUmkmStores(new Set());
      fetchData();
    } catch (error) {
      console.error("Error bulk approving UMKM stores:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyetujui beberapa toko");
    }
  };

  const handleBulkRejectUmkm = async () => {
    if (selectedUmkmStores.size === 0) {
      toast.error("Pilih minimal 1 toko untuk ditolak");
      return;
    }

    setShowBulkUmkmRejectModal(true);
  };

  const handleSubmitBulkUmkmRejection = async () => {
    const reason = bulkUmkmRejectionReason.trim();
    if (reason.length < 10) {
      toast.error("Alasan penolakan harus minimal 10 karakter");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/umkm/bulk-reject', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_ids: Array.from(selectedUmkmStores),
          reason
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menolak toko");
      }

      toast.success(data.message || `${selectedUmkmStores.size} toko berhasil ditolak`);
      setSelectedUmkmStores(new Set());
      setBulkUmkmRejectionReason("");
      setShowBulkUmkmRejectModal(false);
      fetchData();
    } catch (error) {
      console.error("Error bulk rejecting UMKM stores:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menolak beberapa toko");
    }
  };

  const handleUpdateUserRole_OLD = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengupdate role user");
      }

      toast.success("Role user berhasil diupdate");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  const menuItems = [
    { id: "businesses", icon: Store, label: "Bisnis UMKM" },
    { id: "products", icon: Package, label: "Produk" },
    { id: "roleRequests", icon: UserCog, label: "Request Role" },
    { id: "umkmStores", icon: Store, label: "Toko UMKM Pending" },
    { id: "pendingProducts", icon: Package, label: "Produk Pending" },
    { id: "users", icon: Users, label: "Manajemen User" },
    { id: "events", icon: Calendar, label: "Acara" },
    { id: "giftPackages", icon: Gift, label: "Paket Hadiah" },
  ];

  // Guard: hanya tampilkan jika panel terbuka
  if (!isOpen) {
    console.log('AdminPanel not open, returning null');
    return null;
  }

  // Guard: hanya admin yang bisa akses
  console.log('AdminPanel checking user role:', user?.role);
  if (!user || user.role !== "admin") {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-4">Akses Ditolak</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Anda tidak memiliki izin untuk mengakses Admin Panel.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  console.log('AdminPanel rendering main content');

  // Render with error boundary
  try {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 text-white flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Store className="size-6" />
              </div>
              <div>
                <h2 className="text-white">Admin Panel</h2>
                <p className="text-xs text-slate-400">Pasar UMKM</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSelectedItems(new Set());
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${activeTab === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
                  }`}
              >
                <item.icon className="size-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <X className="size-4" />
              <span className="text-sm">Tutup Panel</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-8 py-4">
            <h2 className="text-slate-800 mb-1">
              {menuItems.find((m) => m.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-slate-500">
              Kelola data{" "}
              {menuItems.find((m) => m.id === activeTab)?.label.toLowerCase()}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-8">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Memuat data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : activeTab === "events" ? (
              <div className="bg-white rounded-lg p-6">
                <EventManagement />
              </div>
            ) : activeTab === "giftPackages" ? (
              <div className="bg-white rounded-lg p-6">
                <GiftPackageManagement />
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-4 mb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {activeTab === "roleRequests" ? (
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors flex items-center gap-2">
                            <Filter className="size-4" />
                            Filter
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Search */}
                    <div className="flex-1 max-w-md relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari data..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    {activeTab === "businesses" && (
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Nama UMKM
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Pemilik
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Kategori
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {businesses
                            .filter(
                              (b) =>
                                (b.name || '')
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                (b.owner || '')
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                            )
                            .map((business) => (
                              <tr key={business.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {business.id.substring(0, 8)}...
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={business.image}
                                      alt={business.name}
                                      className="w-10 h-10 rounded-lg object-cover"
                                    />
                                    <span className="text-sm font-medium text-slate-900">
                                      {business.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {business.owner}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                                    {business.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setImageEditModal({
                                        isOpen: true,
                                        itemId: Number(business.id),
                                        currentImage: business.image || '',
                                        itemType: 'umkm',
                                        itemName: business.name
                                      })}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Edit Gambar"
                                    >
                                      <Image className="size-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteBusiness(business.id)
                                      }
                                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Hapus"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === "products" && (
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Produk
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Kategori
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Harga
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              UMKM
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {products
                            .filter((p) =>
                              (p.name || '')
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            )
                            .map((product) => (
                              <tr key={product.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {product.image && (
                                      <img
                                        src={
                                          product.image.startsWith('http://') || product.image.startsWith('https://')
                                            ? product.image
                                            : `http://localhost:8000/${product.image}`
                                        }
                                        alt={product.name}
                                        className="w-10 h-10 rounded-lg object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                                        }}
                                      />
                                    )}
                                    <div>
                                      <p className="text-sm font-medium text-slate-900">
                                        {product.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {product.description}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">
                                    {product.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                  {formatCurrency(product.price)}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {businesses.find(
                                    (b) => b.id === product.businessId
                                  )?.name || "-"}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setImageEditModal({
                                        isOpen: true,
                                        itemId: Number(product.id),
                                        currentImage: product.image?.startsWith('http://') || product.image?.startsWith('https://')
                                          ? product.image
                                          : `http://localhost:8000/${product.image}`,
                                        itemType: 'product',
                                        itemName: product.name
                                      })}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Edit Gambar"
                                    >
                                      <Image className="size-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteProduct(product.id)
                                      }
                                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Hapus"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === "roleRequests" && (
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Tanggal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Nama
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Alasan Pengajuan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Role Saat Ini
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Role Diminta
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {roleRequests
                            .filter((r) => {
                              const matchesSearch =
                                (r.userName || '')
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                (r.userEmail || '')
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase());
                              const matchesFilter =
                                filterStatus === "all" ||
                                r.status === filterStatus;
                              return matchesSearch && matchesFilter;
                            })
                            .map((request) => (
                              <tr key={request.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {formatDate(request.submittedAt)}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-900">
                                  {request.userName}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {request.userEmail}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700 max-w-xs">
                                  <div
                                    className="line-clamp-2"
                                    title={request.reason}
                                  >
                                    {request.reason}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                                    {request.currentRole}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded capitalize">
                                    {request.requestedRole}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs ${request.status === "approved"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : request.status === "rejected"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-amber-100 text-amber-700"
                                      }`}
                                  >
                                    {request.status === "approved"
                                      ? "Disetujui"
                                      : request.status === "rejected"
                                        ? "Ditolak"
                                        : "Pending"}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  {request.status === "pending" && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleApproveRoleRequest(request.id)
                                        }
                                        className="text-emerald-600 hover:text-emerald-700"
                                        title="Setujui"
                                      >
                                        <Check className="size-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleRejectRoleRequest(request.id)
                                        }
                                        className="text-rose-600 hover:text-rose-700"
                                        title="Tolak"
                                      >
                                        <XCircle className="size-4" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === "umkmStores" && (
                      <>
                        {/* Bulk Action Buttons */}
                        {selectedUmkmStores.size > 0 && (
                          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900">
                              {selectedUmkmStores.size} toko dipilih
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={handleBulkApproveUmkm}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Check className="size-4" />
                                Setujui Terpilih
                              </button>
                              <button
                                onClick={handleBulkRejectUmkm}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                              >
                                <XCircle className="size-4" />
                                Tolak Terpilih
                              </button>
                            </div>
                          </div>
                        )}

                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedUmkmStores.size > 0 && selectedUmkmStores.size === umkmStores.filter(s => s.status === 'pending').length}
                                  onChange={handleSelectAllUmkmStores}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Tanggal
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Nama Toko
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Pemilik
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Kategori
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Produk
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {umkmStores
                              .filter((store) => {
                                const matchesSearch =
                                  (store.nama_toko || '')
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()) ||
                                  (store.nama_pemilik || '')
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()) ||
                                  (store.email &&
                                    store.email
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase()));
                                const matchesFilter =
                                  filterStatus === "all" ||
                                  (store.status && store.status === filterStatus);
                                return matchesSearch && matchesFilter;
                              })
                              .map((store) => (
                                <tr key={store.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-4">
                                    {store.status === 'pending' && (
                                      <input
                                        type="checkbox"
                                        checked={selectedUmkmStores.has(Number(store.id))}
                                        onChange={() => handleSelectUmkmStore(Number(store.id))}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-600">
                                    {store.created_at ? formatDate(store.created_at) : '-'}
                                  </td>
                                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                    {store.nama_toko}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-700">
                                    {store.nama_pemilik}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-600">
                                    {store.email || store.user?.email || "-"}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-600">
                                    {store.category?.nama_kategori || "-"}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-600">
                                    {store.products?.length || 0} produk
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs ${store.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : store.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                      {store.status === "pending"
                                        ? "Menunggu"
                                        : store.status === "active"
                                          ? "Aktif"
                                          : "Ditolak"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          setSelectedStoreDetail(store)
                                        }
                                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                      >
                                        Lihat Detail
                                      </button>
                                      <button
                                        onClick={() => setImageEditModal({
                                          isOpen: true,
                                          itemId: Number(store.id),
                                          currentImage: store.foto_toko || '',
                                          itemType: 'umkm',
                                          itemName: store.nama_toko
                                        })}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit Gambar Toko"
                                      >
                                        <Image className="size-5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleApproveUmkmStore(store.id)
                                        }
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Setujui"
                                      >
                                        <Check className="size-5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleRejectUmkmStore(store.id)
                                        }
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Tolak"
                                      >
                                        <XCircle className="size-5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </>
                    )}

                    {activeTab === "users" && (
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Nama
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {users
                            .filter(
                              (u) =>
                                u.name
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                u.email
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                            )
                            .map((userItem) => (
                              <tr key={userItem.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm text-slate-900">
                                  {userItem.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {userItem.email}
                                </td>
                                <td className="px-6 py-4">
                                  <select
                                    value={userItem.role}
                                    onChange={(e) =>
                                      handleUpdateUserRole(
                                        userItem.id,
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-indigo-500 capitalize"
                                  >
                                    <option value="customer">Customer</option>
                                    <option value="umkm_owner">UMKM Owner</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {userItem.createdAt
                                    ? formatDate(userItem.createdAt)
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === "pendingProducts" && (
                      <>
                        {/* Bulk Action Buttons for Products */}
                        {selectedProducts.size > 0 && (
                          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900">
                              {selectedProducts.size} produk dipilih
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={handleBulkApprove}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Check className="size-4" />
                                Setujui Terpilih
                              </button>
                              <button
                                onClick={handleBulkReject}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                              >
                                <XCircle className="size-4" />
                                Tolak Terpilih
                              </button>
                            </div>
                          </div>
                        )}

                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.size > 0 && selectedProducts.size === pendingProducts.length}
                                  onChange={handleSelectAllProducts}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Nama Produk
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Toko
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Harga
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Stok
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Kategori
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {pendingProducts
                              .filter(
                                (p) =>
                                  (p.nama_produk || '')
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()) ||
                                  (p.nama_toko || '')
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())
                              )
                              .map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-4">
                                    <input
                                      type="checkbox"
                                      checked={selectedProducts.has(product.id)}
                                      onChange={() => handleSelectProduct(product.id)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      {product.gambar && (
                                        <img
                                          src={`http://localhost:8000/${product.gambar}`}
                                          alt={product.nama_produk}
                                          className="w-10 h-10 rounded-lg object-cover"
                                        />
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-slate-900">
                                          {product.nama_produk}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {product.deskripsi?.substring(0, 50)}
                                          {(product.deskripsi?.length || 0) > 50 ? '...' : ''}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div>
                                      <p className="text-sm font-medium text-slate-900">
                                        {product.nama_toko}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {product.nama_pemilik}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-900">
                                    {formatCurrency(product.harga)}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-900">
                                    {product.stok}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-800">
                                      {product.kategori || 'Uncategorized'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleApproveProduct(product.id)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Setujui"
                                      >
                                        <Check className="size-5" />
                                      </button>
                                      <button
                                        onClick={() => handleRejectProduct(product.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Tolak"
                                      >
                                        <XCircle className="size-5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Detail Toko UMKM */}
        {selectedStoreDetail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Detail Pengajuan Toko UMKM
                </h2>
                <button
                  onClick={() => setSelectedStoreDetail(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Toko */}
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Store className="size-5" />
                    Informasi Toko
                  </h3>

                  {/* Foto Toko */}
                  {selectedStoreDetail.foto_toko ? (
                    <div className="mb-4">
                      <img
                        src={
                          selectedStoreDetail.foto_toko.startsWith("data:image")
                            ? selectedStoreDetail.foto_toko
                            : `http://localhost:8000/${selectedStoreDetail.foto_toko}`
                        }
                        alt={selectedStoreDetail.nama_toko}
                        className="w-full max-h-64 object-cover rounded-lg border-2 border-slate-200"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center border-2 border-slate-300">
                      <div className="text-center text-slate-500">
                        <Store className="size-16 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium">Belum ada foto toko</p>
                        <p className="text-xs mt-1">
                          User belum mengupload logo/foto toko
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Nama Toko</p>
                      <p className="font-semibold text-slate-900">
                        {selectedStoreDetail.nama_toko}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Pemilik</p>
                      <p className="font-semibold text-slate-900">
                        {selectedStoreDetail.nama_pemilik}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Kategori</p>
                      <p className="font-semibold text-slate-900">
                        {selectedStoreDetail.category?.nama_kategori || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedStoreDetail.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedStoreDetail.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {selectedStoreDetail.status === "pending"
                          ? "Menunggu"
                          : selectedStoreDetail.status === "active"
                            ? "Aktif"
                            : "Ditolak"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-500">Deskripsi Toko</p>
                      <p className="text-slate-900 mt-1">
                        {selectedStoreDetail.deskripsi}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kontak */}
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Informasi Kontak
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="text-slate-900">
                        {selectedStoreDetail.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">WhatsApp</p>
                      <p className="text-slate-900">
                        {selectedStoreDetail.whatsapp || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Telepon</p>
                      <p className="text-slate-900">
                        {selectedStoreDetail.telepon || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Instagram</p>
                      <p className="text-slate-900">
                        {selectedStoreDetail.instagram || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Produk yang diajukan */}
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Package className="size-5" />
                    Produk yang Diajukan (
                    {selectedStoreDetail.products?.length || 0})
                  </h3>
                  {selectedStoreDetail.products &&
                    selectedStoreDetail.products.length > 0 ? (
                    <div className="space-y-4">
                      {selectedStoreDetail.products.map((product) => {
                        const productId = product.id;
                        const approval = productApprovals.get(productId);
                        const isRejected = approval?.action === 'reject';

                        return (
                          <div
                            key={product.id}
                            className={`bg-white rounded-lg p-4 border-2 transition-all ${isRejected
                              ? 'border-red-300 bg-red-50'
                              : approval?.action === 'approve'
                                ? 'border-green-300 bg-green-50'
                                : 'border-slate-200'
                              }`}
                          >
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                {product.gambar ? (
                                  <img
                                    src={getImageUrl(product.gambar, "http://localhost:8000", getPlaceholderDataUrl("No Image", 128, 128))}
                                    alt={product.nama_produk}
                                    className="w-32 h-32 object-cover rounded-lg"
                                    onError={(e) => handleImageError(e, "No Image")}
                                  />
                                ) : (
                                  <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                                    <Package className="size-12 text-slate-400" />
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 space-y-2">
                                <div>
                                  <h4 className="font-semibold text-slate-900 text-lg">
                                    {product.nama_produk}
                                  </h4>
                                  <p className="text-sm text-slate-600 mt-1">
                                    {product.deskripsi}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4">
                                  <span className="text-lg font-bold text-emerald-600">
                                    Rp {product.harga.toLocaleString("id-ID")}
                                  </span>
                                  {product.kategori && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                      {product.kategori}
                                    </span>
                                  )}
                                </div>

                                {/* Approval Actions - Only show for pending stores */}
                                {selectedStoreDetail.status === "pending" && (
                                  <div className="mt-3 space-y-2">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleProductAction(productId, 'approve')}
                                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${approval?.action === 'approve' || !approval
                                          ? 'bg-green-600 text-white hover:bg-green-700'
                                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                          }`}
                                      >
                                        <Check className="size-4 inline mr-1" />
                                        Terima Produk
                                      </button>
                                      <button
                                        onClick={() => handleProductAction(productId, 'reject')}
                                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${isRejected
                                          ? 'bg-red-600 text-white hover:bg-red-700'
                                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                          }`}
                                      >
                                        <XCircle className="size-4 inline mr-1" />
                                        Tolak Produk
                                      </button>
                                    </div>

                                    {/* Comment field - show when rejected */}
                                    {isRejected && (
                                      <div className="space-y-3">
                                        <div>
                                          <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Alasan Penolakan:
                                          </label>
                                          <textarea
                                            value={approval?.comment || ''}
                                            onChange={(e) => handleProductComment(productId, e.target.value)}
                                            placeholder="Jelaskan alasan penolakan produk ini..."
                                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                                            rows={2}
                                          />
                                        </div>

                                        {/* Tombol Kirim Penolakan Individual */}
                                        <button
                                          onClick={async () => {
                                            if (!approval?.comment?.trim()) {
                                              toast.error('Harap isi alasan penolakan terlebih dahulu');
                                              return;
                                            }

                                            if (confirm(`Yakin ingin menolak produk "${product.nama_produk}"?`)) {
                                              try {
                                                const response = await fetch(
                                                  `http://localhost:8000/api/products/${productId}/reject`,
                                                  {
                                                    method: 'POST',
                                                    headers: {
                                                      'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                      comment: approval.comment,
                                                    }),
                                                  }
                                                );

                                                const data = await response.json();

                                                if (!response.ok) {
                                                  throw new Error(data.message || 'Gagal menolak produk');
                                                }

                                                toast.success(`Produk "${product.nama_produk}" berhasil ditolak`);

                                                // Clear approval map
                                                setProductApprovals(new Map());

                                                // Close detail modal
                                                setSelectedStoreDetail(null);

                                                // Refresh data to update the list
                                                await fetchData();
                                              } catch (error) {
                                                console.error('Error rejecting product:', error);
                                                toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
                                              }
                                            }
                                          }}
                                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                          <XCircle className="size-4" />
                                          Kirim Penolakan Produk Ini
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">
                      Tidak ada produk yang diajukan
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedStoreDetail.status === "pending" && (
                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    {/* UMKM Store Action */}
                    <div className="bg-white rounded-lg p-4 border-2 border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-3">Keputusan Toko UMKM</h4>
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setUmkmAction('approve')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${umkmAction === 'approve'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                            }`}
                        >
                          <Check className="size-4 inline mr-1" />
                          Terima Toko
                        </button>
                        <button
                          onClick={() => setUmkmAction('reject')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${umkmAction === 'reject'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                            }`}
                        >
                          <XCircle className="size-4 inline mr-1" />
                          Tolak Toko
                        </button>
                      </div>

                      {umkmAction === 'reject' && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Alasan Penolakan Toko:
                          </label>
                          <textarea
                            value={umkmComment}
                            onChange={(e) => setUmkmComment(e.target.value)}
                            placeholder="Jelaskan alasan penolakan toko ini..."
                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                            rows={3}
                          />
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setSelectedStoreDetail(null);
                          setProductApprovals(new Map());
                          setUmkmComment("");
                          setUmkmAction('approve');
                        }}
                        className="px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSubmitApprovalWithProducts}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Check className="size-5" />
                        Proses Pengajuan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Reject Product dengan Reason */}
        {rejectingProduct && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold mb-4">Tolak Produk</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Produk: <strong>{rejectingProduct.nama_produk}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Toko: <strong>{rejectingProduct.nama_toko}</strong>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Alasan Penolakan * <span className="text-gray-500 text-xs">(minimal 10 karakter)</span>
                </label>
                <textarea
                  value={productRejectionReason}
                  onChange={(e) => setProductRejectionReason(e.target.value)}
                  placeholder="Berikan alasan penolakan produk ini..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px]"
                  rows={4}
                />
                <div className="mt-1 text-right">
                  <span className={`text-xs ${productRejectionReason.trim().length < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {productRejectionReason.trim().length}/10 karakter
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setRejectingProduct(null);
                    setProductRejectionReason("");
                  }}
                  className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitProductRejection}
                  disabled={!productRejectionReason.trim()}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <XCircle className="size-5" />
                  Tolak Produk
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UMKM Bulk Reject Modal */}
        {showBulkUmkmRejectModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tolak {selectedUmkmStores.size} Toko UMKM
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Alasan Penolakan * <span className="text-gray-500 text-xs">(minimal 10 karakter)</span>
                </label>
                <textarea
                  value={bulkUmkmRejectionReason}
                  onChange={(e) => setBulkUmkmRejectionReason(e.target.value)}
                  placeholder="Berikan alasan penolakan untuk toko-toko ini..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px]"
                  rows={4}
                />
                <div className="mt-1 text-right">
                  <span className={`text-xs ${bulkUmkmRejectionReason.trim().length < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {bulkUmkmRejectionReason.trim().length}/10 karakter
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowBulkUmkmRejectModal(false);
                    setBulkUmkmRejectionReason("");
                  }}
                  className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitBulkUmkmRejection}
                  disabled={bulkUmkmRejectionReason.trim().length < 10}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <XCircle className="size-5" />
                  Tolak {selectedUmkmStores.size} Toko
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Bulk Reject Modal */}
        {showBulkRejectModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tolak {selectedProducts.size} Produk
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Alasan Penolakan * <span className="text-gray-500 text-xs">(minimal 10 karakter)</span>
                </label>
                <textarea
                  value={bulkRejectionReason}
                  onChange={(e) => setBulkRejectionReason(e.target.value)}
                  placeholder="Berikan alasan penolakan untuk produk-produk ini..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px]"
                  rows={4}
                />
                <div className="mt-1 text-right">
                  <span className={`text-xs ${bulkRejectionReason.trim().length < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {bulkRejectionReason.trim().length}/10 karakter
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowBulkRejectModal(false);
                    setBulkRejectionReason("");
                  }}
                  className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitBulkRejection}
                  disabled={bulkRejectionReason.trim().length < 10}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <XCircle className="size-5" />
                  Tolak {selectedProducts.size} Produk
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Edit Modal */}
        {imageEditModal && (
          <ImageEditModal
            isOpen={imageEditModal.isOpen}
            onClose={() => setImageEditModal(null)}
            itemId={imageEditModal.itemId}
            currentImage={imageEditModal.currentImage}
            itemType={imageEditModal.itemType}
            itemName={imageEditModal.itemName}
            onSuccess={() => {
              setImageEditModal(null);
              fetchData(); // Refresh data after successful update
            }}
          />
        )}
      </div>
    );
  } catch (err: any) {
    console.error('AdminPanel render error:', err);
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-4">Error Rendering Admin Panel</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Terjadi kesalahan saat menampilkan panel admin.
          </p>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs mb-4 overflow-auto max-h-40">
            {err?.message || String(err)}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Reload Page
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}
