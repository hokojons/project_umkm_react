import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, CheckCircle, XCircle, Clock, Store, Calendar } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, BASE_HOST } from "../config/api";

interface GiftPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  stok: number;
  category: string;
  image: string;
  items: string[];
  createdAt: string;
  status?: string;
  umkm_id?: number | null;
  umkm?: {
    id: number;
    nama_toko: string;
    nama_pemilik: string;
  } | null;
  tanggal_mulai?: string | null;
  tanggal_akhir?: string | null;
  alasan_penolakan?: string | null;
  is_expired?: boolean;
}

interface ActiveUmkm {
  id: number;
  nama_toko: string;
  nama_pemilik: string;
}

export function GiftPackageManagement() {
  const [packages, setPackages] = useState<GiftPackage[]>([]);
  const [activeUmkmList, setActiveUmkmList] = useState<ActiveUmkm[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "rejected" | "expired" | "all">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<GiftPackage> & { umkm_id?: number | null; tanggal_mulai?: string; tanggal_akhir?: string }>({
    name: "",
    description: "",
    price: 0,
    stok: 100,
    category: "Natal",
    image: "",
    items: [""],
    umkm_id: null, // null = Official/Gereja
    tanggal_mulai: "",
    tanggal_akhir: "",
  });

  // Predefined package templates
  const packageTemplates = [
    {
      name: "Paket Natal Gereja",
      description: "Paket spesial Natal untuk jemaat gereja dan keluarga",
      price: 350000,
      category: "Natal",
      items: [
        "Stollen (Roti Natal Jerman)",
        "Cookies Jahe Natal",
        "Fruit Cake",
        "Lilin Advent",
        "Kartu Ucapan Natal",
      ],
    },
    {
      name: "Paket Paskah Gereja",
      description: "Paket perayaan Paskah untuk merayakan kebangkitan Kristus bersama jemaat",
      price: 275000,
      category: "Paskah",
      items: [
        "Roti Paskah (Hot Cross Buns)",
        "Telur Paskah Hias",
        "Salib Kayu Ukir",
        "Kartu Ucapan Paskah",
      ],
    },
  ];

  useEffect(() => {
    loadPackages();
    loadActiveUmkm();
  }, [activeTab]);

  const loadPackages = async () => {
    try {
      let url = `${API_BASE_URL}/gift-packages`;
      if (activeTab === 'pending') {
        url = `${API_BASE_URL}/gift-packages/pending`;
      } else if (activeTab === 'all') {
        url = `${API_BASE_URL}/gift-packages/all`;
      } else {
        url = `${API_BASE_URL}/gift-packages/all`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        let filteredPackages = data.data;

        // Filter by status for non-pending tabs
        if (activeTab === 'active') {
          filteredPackages = data.data.filter((p: GiftPackage) => p.status === 'active' && !p.is_expired);
        } else if (activeTab === 'rejected') {
          filteredPackages = data.data.filter((p: GiftPackage) => p.status === 'rejected');
        } else if (activeTab === 'expired') {
          filteredPackages = data.data.filter((p: GiftPackage) => p.is_expired);
        }

        setPackages(filteredPackages);
      } else {
        toast.error('Gagal memuat paket hadiah');
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      toast.error('Gagal memuat paket hadiah');
    }
  };

  const loadActiveUmkm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gift-packages/active-umkm`);
      const data = await response.json();
      if (data.success) {
        setActiveUmkmList(data.data);
      }
    } catch (error) {
      console.error('Error loading active UMKM:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = "Nama Paket wajib diisi";
    if (!formData.description?.trim()) errors.description = "Deskripsi wajib diisi";
    if (!formData.price || formData.price <= 0) errors.price = "Harga wajib diisi";
    if (!formData.stok || formData.stok <= 0) errors.stok = "Stok wajib diisi";
    if (!formData.tanggal_mulai) errors.tanggal_mulai = "Tanggal Mulai wajib diisi";
    if (!formData.tanggal_akhir) errors.tanggal_akhir = "Tanggal Akhir wajib diisi";
    const validItems = (formData.items || []).filter(i => i.trim() !== '');
    if (validItems.length === 0) errors.items = "Minimal 1 item dalam paket";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const fieldNames = Object.values(errors).join(', ');
      toast.error(`Data belum lengkap: ${fieldNames}`);
      return;
    }
    setFormErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stok', formData.stok.toString());
      formDataToSend.append('category', formData.category || 'Lainnya');

      // Add umkm_id (null for official/gereja)
      if (formData.umkm_id) {
        formDataToSend.append('umkm_id', formData.umkm_id.toString());
      }

      // Add validity dates
      if (formData.tanggal_mulai) {
        formDataToSend.append('tanggal_mulai', formData.tanggal_mulai);
      }
      if (formData.tanggal_akhir) {
        formDataToSend.append('tanggal_akhir', formData.tanggal_akhir);
      }

      // Add items array
      if (formData.items && formData.items.length > 0) {
        const validItems = formData.items.filter(item => item.trim() !== '');
        validItems.forEach((item, index) => {
          formDataToSend.append(`items[${index}]`, item);
        });
      }

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image && formData.image.startsWith('http')) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${API_BASE_URL}/gift-packages`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        await loadPackages();
        resetForm();
        toast.success("Paket hadiah berhasil dibuat!");
        setActiveTab('active'); // Switch to active tab
      } else {
        toast.error(data.message || 'Gagal membuat paket hadiah');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      toast.error('Gagal membuat paket hadiah');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = "Nama Paket wajib diisi";
    if (!formData.description?.trim()) errors.description = "Deskripsi wajib diisi";
    if (!formData.price || formData.price <= 0) errors.price = "Harga wajib diisi";
    if (!formData.stok || formData.stok <= 0) errors.stok = "Stok wajib diisi";
    if (!formData.tanggal_mulai) errors.tanggal_mulai = "Tanggal Mulai wajib diisi";
    if (!formData.tanggal_akhir) errors.tanggal_akhir = "Tanggal Akhir wajib diisi";
    const validItemsCheck = (formData.items || []).filter(i => i.trim() !== '');
    if (validItemsCheck.length === 0) errors.items = "Minimal 1 item dalam paket";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const fieldNames = Object.values(errors).join(', ');
      toast.error(`Data belum lengkap: ${fieldNames}`);
      return;
    }
    setFormErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('_method', 'PUT');
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('price', (formData.price || 0).toString());
      formDataToSend.append('stok', (formData.stok || 0).toString());
      formDataToSend.append('category', formData.category || 'Lainnya');

      // Add umkm_id
      if (formData.umkm_id !== undefined) {
        formDataToSend.append('umkm_id', formData.umkm_id?.toString() || '');
      }

      // Add validity dates
      if (formData.tanggal_mulai) {
        formDataToSend.append('tanggal_mulai', formData.tanggal_mulai);
      }
      if (formData.tanggal_akhir) {
        formDataToSend.append('tanggal_akhir', formData.tanggal_akhir);
      }

      // Add items array
      if (formData.items && formData.items.length > 0) {
        const validItems = formData.items.filter(item => item.trim() !== '');
        validItems.forEach((item, index) => {
          formDataToSend.append(`items[${index}]`, item);
        });
      }

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image && formData.image.startsWith('http')) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${API_BASE_URL}/gift-packages/${editingId}`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        await loadPackages();
        resetForm();
        toast.success("Paket hadiah berhasil diupdate!");
      } else {
        toast.error(data.message || 'Gagal mengupdate paket hadiah');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Gagal mengupdate paket hadiah');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/gift-packages/${id}/approve`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Paket berhasil disetujui!");
        await loadPackages();
      } else {
        toast.error(data.message || 'Gagal menyetujui paket');
      }
    } catch (error) {
      console.error('Error approving package:', error);
      toast.error('Gagal menyetujui paket');
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) {
      toast.error("Mohon isi alasan penolakan");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/gift-packages/${rejectingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alasan: rejectReason }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Paket ditolak");
        setRejectingId(null);
        setRejectReason("");
        await loadPackages();
      } else {
        toast.error(data.message || 'Gagal menolak paket');
      }
    } catch (error) {
      console.error('Error rejecting package:', error);
      toast.error('Gagal menolak paket');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus paket hadiah ini?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/gift-packages/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadPackages();
        toast.success("Paket hadiah berhasil dihapus!");
      } else {
        toast.error(data.message || 'Gagal menghapus paket hadiah');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Gagal menghapus paket hadiah');
    }
  };

  const handleEdit = (pkg: GiftPackage) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      stok: pkg.stok,
      category: pkg.category,
      image: pkg.image,
      items: pkg.items.length > 0 ? pkg.items.map(item => typeof item === 'string' ? item : (item as any)?.nama || '') : [""],
      umkm_id: pkg.umkm_id || null,
      tanggal_mulai: pkg.tanggal_mulai || "",
      tanggal_akhir: pkg.tanggal_akhir || "",
    });
    setIsCreating(false);
  };

  const handleUseTemplate = (template: (typeof packageTemplates)[0]) => {
    setFormData({
      name: template.name,
      description: template.description,
      price: template.price,
      category: template.category,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400",
      items: [...template.items],
      umkm_id: null,
      tanggal_mulai: "",
      tanggal_akhir: "",
    });
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setFormData({
      name: "",
      description: "",
      price: 0,
      stok: 100,
      category: "Natal",
      image: "",
      items: [""],
      umkm_id: null,
      tanggal_mulai: "",
      tanggal_akhir: "",
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...(formData.items || []), ""],
    });
  };

  const removeItem = (index: number) => {
    const items = [...(formData.items || [])];
    items.splice(index, 1);
    setFormData({ ...formData, items });
  };

  const updateItem = (index: number, value: string) => {
    const items = [...(formData.items || [])];
    items[index] = value;
    setFormData({ ...formData, items });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (pkg: GiftPackage) => {
    // Check if expired first (highest priority for active packages)
    if (pkg.is_expired && pkg.status === 'active') {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 text-xs rounded-full">Expired</span>;
    }

    switch (pkg.status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Aktif</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Menunggu</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Ditolak</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-slate-900 dark:text-white text-base sm:text-lg">Manajemen Paket Hadiah</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            Kelola paket hadiah spesial untuk berbagai acara
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              price: 0,
              stok: 100,
              category: "Lebaran",
              image: "",
              items: [""],
              umkm_id: null,
              tanggal_mulai: "",
              tanggal_akhir: "",
            });
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Buat Paket Baru
        </button>
      </div>

      {/* Search Box */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari paket berdasarkan nama..."
          className="w-full md:w-80 px-4 py-2 pl-10 border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <svg className="absolute left-3 top-2.5 size-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-slate-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'pending'
            ? 'border-b-2 border-amber-500 text-amber-600'
            : 'text-slate-500 hover:text-slate-700 dark:text-gray-400'
            }`}
        >
          <Clock className="size-3.5 sm:size-4 inline mr-1 sm:mr-2" />
          Pending
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'active'
            ? 'border-b-2 border-green-500 text-green-600'
            : 'text-slate-500 hover:text-slate-700 dark:text-gray-400'
            }`}
        >
          <CheckCircle className="size-3.5 sm:size-4 inline mr-1 sm:mr-2" />
          Aktif
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'rejected'
            ? 'border-b-2 border-red-500 text-red-600'
            : 'text-slate-500 hover:text-slate-700 dark:text-gray-400'
            }`}
        >
          <XCircle className="size-3.5 sm:size-4 inline mr-1 sm:mr-2" />
          Ditolak
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'expired'
            ? 'border-b-2 border-gray-500 text-gray-600'
            : 'text-slate-500 hover:text-slate-700 dark:text-gray-400'
            }`}
        >
          <Clock className="size-3.5 sm:size-4 inline mr-1 sm:mr-2" />
          Expired
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'all'
            ? 'border-b-2 border-indigo-500 text-indigo-600'
            : 'text-slate-500 hover:text-slate-700 dark:text-gray-400'
            }`}
        >
          Semua
        </button>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Tolak Paket</h4>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-sm mb-4 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Tolak Paket
              </button>
              <button
                onClick={() => { setRejectingId(null); setRejectReason(""); }}
                className="px-4 py-2 bg-slate-200 dark:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-300 text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Section */}
      {isCreating && !editingId && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
          <h4 className="text-sm text-indigo-900 dark:text-indigo-200 mb-3">
            Template Paket Hadiah
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {packageTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleUseTemplate(template)}
                className="text-left p-3 bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-500 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {template.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                  {formatCurrency(template.price)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-slate-900 dark:text-white">
              {editingId ? "Edit Paket Hadiah" : "Buat Paket Hadiah Baru (Admin)"}
            </h4>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:text-gray-300">
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Owner Selection */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                <Store className="size-4 inline mr-2" />
                Pemilik Paket
              </label>
              <select
                value={formData.umkm_id || ""}
                onChange={(e) => setFormData({ ...formData, umkm_id: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="">🏛️ Gereja (Paket Resmi)</option>
                {activeUmkmList.map((umkm) => (
                  <option key={umkm.id} value={umkm.id}>
                    🏪 {umkm.nama_toko} ({umkm.nama_pemilik})
                  </option>
                ))}
              </select>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                💡 Pilih "Gereja" untuk paket resmi, atau pilih UMKM sebagai pemilik
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-2 ${formErrors.name ? 'text-red-600 font-medium' : 'text-slate-700 dark:text-gray-300'}`}>Nama Paket *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors(prev => { const n = { ...prev }; delete n.name; return n; }); }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white ${formErrors.name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-gray-600'}`}
                  placeholder="Paket Natal Gereja"
                />
                {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm mb-2 text-slate-700 dark:text-gray-300">Kategori *</label>
                <select
                  value={formData.category || "Natal"}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="Natal">Natal</option>
                  <option value="Paskah">Paskah</option>
                  <option value="Pernikahan">Pernikahan</option>
                  <option value="Korporat">Korporat</option>
                  <option value="Wisuda">Wisuda</option>
                  <option value="Baby">Baby</option>
                  <option value="Arisan">Arisan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${formErrors.description ? 'text-red-600 font-medium' : 'text-slate-700 dark:text-gray-300'}`}>Deskripsi *</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setFormErrors(prev => { const n = { ...prev }; delete n.description; return n; }); }}
                className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white ${formErrors.description ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-gray-600'}`}
                rows={3}
                placeholder="Deskripsi lengkap paket hadiah..."
              />
              {formErrors.description && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-2 ${formErrors.price ? 'text-red-600 font-medium' : 'text-slate-700 dark:text-gray-300'}`}>Harga (Rp) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.price ? Number(formData.price).toLocaleString('id-ID') : ''}
                  onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); setFormData({ ...formData, price: val === '' ? 0 : Number(val) }); setFormErrors(prev => { const n = { ...prev }; delete n.price; return n; }); }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white ${formErrors.price ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-gray-600'}`}
                  placeholder="Contoh: 350.000"
                />
                {formErrors.price && <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>}
              </div>

              <div>
                <label className={`block text-sm mb-2 ${formErrors.stok ? 'text-red-600 font-medium' : 'text-slate-700 dark:text-gray-300'}`}>Stok *</label>
                <input
                  type="number"
                  value={formData.stok || ""}
                  onChange={(e) => { setFormData({ ...formData, stok: e.target.value === '' ? 0 : Number(e.target.value) }); setFormErrors(prev => { const n = { ...prev }; delete n.stok; return n; }); }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white ${formErrors.stok ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-gray-600'}`}
                  min="0"
                />
                {formErrors.stok && <p className="text-xs text-red-600 mt-1">{formErrors.stok}</p>}
              </div>
            </div>

            {/* Validity Period */}
            <div className={`bg-slate-50 dark:bg-gray-700/50 border rounded-lg p-4 ${formErrors.tanggal_mulai || formErrors.tanggal_akhir ? 'border-red-400' : 'border-slate-200 dark:border-gray-600'}`}>
              <label className={`block text-sm font-medium mb-3 ${formErrors.tanggal_mulai || formErrors.tanggal_akhir ? 'text-red-600' : 'text-slate-700 dark:text-gray-300'}`}>
                <Calendar className="size-4 inline mr-2" />
                Masa Berlaku *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-1 ${formErrors.tanggal_mulai ? 'text-red-600 font-medium' : 'text-slate-600 dark:text-gray-400'}`}>Tanggal Mulai *</label>
                  <input
                    type="date"
                    value={formData.tanggal_mulai || ""}
                    onChange={(e) => { setFormData({ ...formData, tanggal_mulai: e.target.value }); setFormErrors(prev => { const n = { ...prev }; delete n.tanggal_mulai; return n; }); }}
                    className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white ${formErrors.tanggal_mulai ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-gray-600'}`}
                  />
                  {formErrors.tanggal_mulai && <p className="text-xs text-red-600 mt-1">{formErrors.tanggal_mulai}</p>}
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${formErrors.tanggal_akhir ? 'text-red-600 font-medium' : 'text-slate-600 dark:text-gray-400'}`}>Tanggal Akhir *</label>
                  <input
                    type="date"
                    value={formData.tanggal_akhir || ""}
                    onChange={(e) => { setFormData({ ...formData, tanggal_akhir: e.target.value }); setFormErrors(prev => { const n = { ...prev }; delete n.tanggal_akhir; return n; }); }}
                    className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white ${formErrors.tanggal_akhir ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-gray-600'}`}
                  />
                  {formErrors.tanggal_akhir && <p className="text-xs text-red-600 mt-1">{formErrors.tanggal_akhir}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-slate-700 dark:text-gray-300">Gambar Paket</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-sm ${formErrors.items ? 'text-red-600 font-medium' : 'text-slate-700 dark:text-gray-300'}`}>Item dalam Paket *</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="size-3" />
                  Tambah Item
                </button>
              </div>
              <div className="space-y-2">
                {(formData.items || [""]).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => { updateItem(index, e.target.value); setFormErrors(prev => { const n = { ...prev }; delete n.items; return n; }); }}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white ${formErrors.items ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-gray-600'}`}
                      placeholder={`Item ${index + 1}`}
                    />
                    {(formData.items || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formErrors.items && <p className="text-xs text-red-600 mt-1">{formErrors.items}</p>}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-600">
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm"
              >
                <Save className="size-4" />
                {editingId ? "Simpan Perubahan" : "Buat Paket"}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-slate-200 dark:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-500 text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages
          .filter((pkg) =>
            searchQuery === '' ||
            pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (pkg.umkm?.nama_toko?.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {pkg.image && (
                <img
                  src={
                    pkg.image.startsWith('http://') || pkg.image.startsWith('https://')
                      ? pkg.image
                      : `${BASE_HOST}/${pkg.image}`
                  }
                  alt={pkg.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400";
                  }}
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-slate-900 dark:text-white">{pkg.name}</h4>
                      {pkg.status && getStatusBadge(pkg)}
                    </div>
                    {/* Owner Info */}
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                      {pkg.umkm ? `🏪 ${pkg.umkm.nama_toko}` : '🏛️ Paket Resmi Gereja'}
                    </p>
                    <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded">
                      {pkg.category}
                    </span>
                  </div>
                </div>

                {/* Validity period */}
                {(pkg.tanggal_mulai || pkg.tanggal_akhir) && (
                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">
                    📅 {pkg.tanggal_mulai || '...'} - {pkg.tanggal_akhir || '...'}
                  </p>
                )}

                <p className="text-sm text-slate-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Rejection reason */}
                {pkg.status === 'rejected' && pkg.alasan_penolakan && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mb-3">
                    <p className="text-xs text-red-700 dark:text-red-300">
                      <strong>Alasan:</strong> {pkg.alasan_penolakan}
                    </p>
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">Isi paket:</p>
                  <ul className="space-y-1">
                    {pkg.items.slice(0, 3).map((item, idx) => {
                      const itemName = typeof item === 'string' ? item : (item as any)?.nama || 'Item ' + (idx + 1);
                      return (
                        <li key={idx} className="text-xs text-slate-600 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-indigo-600">•</span>
                          <span className="line-clamp-1">{itemName}</span>
                        </li>
                      );
                    })}
                    {pkg.items.length > 3 && (
                      <li className="text-xs text-slate-400 italic">
                        +{pkg.items.length - 3} item lainnya
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-gray-600">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(pkg.price)}
                  </span>
                  <div className="flex gap-1">
                    {pkg.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(pkg.id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Setujui"
                        >
                          <CheckCircle className="size-4" />
                        </button>
                        <button
                          onClick={() => setRejectingId(pkg.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Tolak"
                        >
                          <XCircle className="size-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {packages.length === 0 && !isCreating && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg">
          <div className="text-slate-400 mb-4">
            {activeTab === 'pending' ? (
              <Clock className="w-16 h-16 mx-auto" />
            ) : activeTab === 'rejected' ? (
              <XCircle className="w-16 h-16 mx-auto" />
            ) : (
              <CheckCircle className="w-16 h-16 mx-auto" />
            )}
          </div>
          <p className="text-slate-500 dark:text-gray-400 mb-4">
            {activeTab === 'pending'
              ? 'Tidak ada paket menunggu persetujuan'
              : activeTab === 'rejected'
                ? 'Tidak ada paket yang ditolak'
                : 'Belum ada paket hadiah'}
          </p>
          {activeTab !== 'pending' && activeTab !== 'rejected' && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2 text-sm"
            >
              <Plus className="size-4" />
              Buat Paket Pertama
            </button>
          )}
        </div>
      )}
    </div>
  );
}
