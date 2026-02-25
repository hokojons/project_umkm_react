import { useState, useEffect, useRef } from "react";
import { X, Plus, Loader, Camera, Trash2, ChevronDown, ChevronUp, Eye, ImagePlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import type { ChangeEvent, FormEvent } from "react";
import { API_BASE_URL } from "../config/api";

// Category mapping based on store type (matching database categories)
const CATEGORY_MAP: Record<string, string[]> = {
  // From database categories table
  "kain & batik": ["Kain", "Batik Tulis", "Batik Cap", "Sarung", "Selendang", "Aksesoris Batik", "Lainnya"],
  "kain": ["Kain", "Batik", "Sarung", "Selendang", "Lainnya"],
  "pakaian": ["Pakaian Pria", "Pakaian Wanita", "Pakaian Anak", "Aksesoris", "Sepatu", "Tas", "Lainnya"],
  "aksesoris": ["Perhiasan", "Gelang", "Kalung", "Cincin", "Anting", "Jam Tangan", "Lainnya"],
  "tas": ["Tas Wanita", "Tas Pria", "Tas Laptop", "Ransel", "Dompet", "Lainnya"],
  "makanan": ["Makanan Berat", "Makanan Ringan", "Snack", "Kue", "Dessert", "Frozen Food", "Lainnya"],
  "kerajinan": ["Dekorasi", "Furniture", "Aksesoris Rumah", "Perhiasan", "Souvenir", "Lainnya"],
  // Legacy mappings
  "minuman": ["Minuman Dingin", "Minuman Panas", "Jus", "Kopi", "Teh", "Smoothie", "Lainnya"],
  "fashion": ["Pakaian Pria", "Pakaian Wanita", "Aksesoris", "Sepatu", "Tas", "Perhiasan", "Lainnya"],
  "jasa": ["Jasa Desain", "Jasa Fotografi", "Jasa Makeup", "Jasa Lainnya"],
  "lainnya": ["Produk Umum", "Aksesoris", "Elektronik", "Peralatan", "Lainnya"],
};

const DEFAULT_CATEGORIES = ["Makanan", "Minuman", "Fashion", "Kerajinan", "Aksesoris", "Kain", "Lainnya"];

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [storeCategory, setStoreCategory] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<string[]>(DEFAULT_CATEGORIES);
  const [formData, setFormData] = useState({
    nama_produk: "",
    harga: "",
    deskripsi: "",
    stok: "",
    kategori: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Variant state
  const [variantsEnabled, setVariantsEnabled] = useState(false);
  const [variantTypes, setVariantTypes] = useState<{
    name: string;
    options: { value: string; price_adjustment: string; stock: string; imageFile?: File; imagePreview?: string }[];
  }[]>([]);
  // Action popup & preview state for variant images
  const [variantActionPopup, setVariantActionPopup] = useState<{ typeIndex: number; optIndex: number } | null>(null);
  const [variantPreviewImage, setVariantPreviewImage] = useState<string | null>(null);
  const variantFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addVariantType = () => {
    if (variantTypes.length >= 2) {
      toast.error("Maksimal 2 tipe varian per produk");
      return;
    }
    setVariantTypes([...variantTypes, { name: "", options: [{ value: "", price_adjustment: "", stock: "" }] }]);
  };

  const removeVariantType = (typeIndex: number) => {
    setVariantTypes(variantTypes.filter((_, i) => i !== typeIndex));
  };

  const updateVariantTypeName = (typeIndex: number, name: string) => {
    const updated = [...variantTypes];
    updated[typeIndex].name = name;
    setVariantTypes(updated);
  };

  const addVariantOption = (typeIndex: number) => {
    const updated = [...variantTypes];
    updated[typeIndex].options.push({ value: "", price_adjustment: "", stock: "" });
    setVariantTypes(updated);
  };

  const removeVariantOption = (typeIndex: number, optIndex: number) => {
    const updated = [...variantTypes];
    updated[typeIndex].options = updated[typeIndex].options.filter((_, i) => i !== optIndex);
    setVariantTypes(updated);
  };

  const updateVariantOption = (
    typeIndex: number,
    optIndex: number,
    field: "value" | "price_adjustment" | "stock",
    val: string
  ) => {
    const updated = [...variantTypes];
    updated[typeIndex].options[optIndex][field] = val;
    setVariantTypes(updated);
  };

  const handleVariantImageChange = (typeIndex: number, optIndex: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Foto varian maks 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...variantTypes];
      updated[typeIndex].options[optIndex].imageFile = file;
      updated[typeIndex].options[optIndex].imagePreview = reader.result as string;
      setVariantTypes(updated);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeVariantImage = (typeIndex: number, optIndex: number) => {
    const updated = [...variantTypes];
    updated[typeIndex].options[optIndex].imageFile = undefined;
    updated[typeIndex].options[optIndex].imagePreview = undefined;
    setVariantTypes(updated);
    setVariantActionPopup(null);
  };

  // Fetch UMKM category on mount
  useEffect(() => {
    const fetchUmkmCategory = async () => {
      if (user) {
        try {
          const response = await fetch(`${API_BASE_URL}/umkm/user/${user.id}`);
          const data = await response.json();
          if (data.success && data.data) {
            const umkm = Array.isArray(data.data) ? data.data[0] : data.data;
            const category = (umkm.kategori || umkm.category || "lainnya").toLowerCase();
            setStoreCategory(category);

            // Get category options based on store category
            const options = CATEGORY_MAP[category] || DEFAULT_CATEGORIES;
            setCategoryOptions(options);
          }
        } catch (error) {
          console.error("Error fetching UMKM:", error);
        }
      }
    };

    if (isOpen) {
      fetchUmkmCategory();
    }
  }, [isOpen, user]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 5 - imageFiles.length;
    if (remaining <= 0) {
      toast.error("Maksimal 5 foto per produk");
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).slice(0, remaining).forEach((file: File) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`File ${file.name} terlalu besar (maks 2MB)`);
        return;
      }
      newFiles.push(file);
    });

    if (newFiles.length === 0) return;

    // Read all files
    let loaded = 0;
    newFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loaded++;
        if (loaded === newFiles.length) {
          setImageFiles(prev => [...prev, ...newFiles]);
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Format price input with thousand separators
  const formatPriceInput = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('id-ID');
  };

  // Parse formatted price back to raw number string
  const parsePriceForSubmit = (formattedValue: string): string => {
    return formattedValue.replace(/\D/g, '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("User tidak ditemukan");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama_produk", formData.nama_produk);
      formDataToSend.append("harga", parsePriceForSubmit(formData.harga));
      formDataToSend.append("deskripsi", formData.deskripsi);
      formDataToSend.append("stok", formData.stok || "0");
      formDataToSend.append("kategori", formData.kategori);

      if (imageFiles.length > 0) {
        formDataToSend.append("gambar", imageFiles[0]);
        // Additional images
        for (let i = 1; i < imageFiles.length; i++) {
          formDataToSend.append("gambar_tambahan[]", imageFiles[i]);
        }
      }

      // Append variants JSON + images
      if (variantsEnabled && variantTypes.length > 0) {
        const variantsData = variantTypes
          .filter(vt => vt.name.trim())
          .map(vt => ({
            name: vt.name.trim(),
            options: vt.options
              .filter(o => o.value.trim())
              .map(o => ({
                value: o.value.trim(),
                price_adjustment: parseFloat(o.price_adjustment.replace(/\D/g, '') || '0'),
                stock: o.stock ? parseInt(o.stock, 10) : null,
              })),
          }));
        if (variantsData.length > 0) {
          formDataToSend.append("variants", JSON.stringify(variantsData));
          // Append variant option images
          let imgIdx = 0;
          variantTypes.forEach(vt => {
            if (!vt.name.trim()) return;
            vt.options.forEach(opt => {
              if (!opt.value.trim()) return;
              if (opt.imageFile) {
                formDataToSend.append(`variant_images[${imgIdx}]`, opt.imageFile);
              }
              imgIdx++;
            });
          });
        }
      }

      const response = await fetch(`${API_BASE_URL}/umkm/add-product`, {
        method: "POST",
        headers: {
          "X-User-ID": user.id,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menambahkan produk");
      }

      toast.success("Produk berhasil ditambahkan!");

      // Reset form
      setFormData({
        nama_produk: "",
        harga: "",
        deskripsi: "",
        stok: "",
        kategori: "",
      });
      setImageFiles([]);
      setImagePreviews([]);
      setVariantsEnabled(false);
      setVariantTypes([]);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
              <Plus className="size-4" />
            </span>
            Tambah Produk Baru
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* ═══════════════════════════════════════ */}
          {/* PHOTO SECTION */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">
                Foto Produk <span className="text-red-500">*</span>
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded font-medium">Foto 1:1</span>
                <span>{imagePreviews.length}/5</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Existing Previews */}
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-slate-100">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Main photo overlay */}
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-5">
                      <span className="text-white text-[11px] font-semibold flex items-center gap-1">
                        ⭐ Foto Produk Utama
                      </span>
                    </div>
                  )}
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}

              {/* Add Photo Slot */}
              {imagePreviews.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:border-orange-400 hover:bg-orange-50/50 transition-all">
                  <Camera className="size-7 text-slate-400" />
                  <span className="text-[11px] text-slate-400 font-medium">+ Tambah Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 mb-5" />

          {/* ═══════════════════════════════════════ */}
          {/* PRODUCT NAME */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{formData.nama_produk.length}/100</span>
            </div>
            <input
              type="text"
              value={formData.nama_produk}
              onChange={(e) =>
                setFormData({ ...formData, nama_produk: e.target.value })
              }
              maxLength={100}
              required
              className="w-full px-4 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-0 focus:border-orange-400 outline-none transition-colors placeholder:text-slate-400"
              placeholder="Masukkan Nama Produk"
            />
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* DESCRIPTION */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Deskripsi Produk <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{formData.deskripsi.length}/3000</span>
            </div>
            <textarea
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              maxLength={3000}
              rows={4}
              className="w-full px-4 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-0 focus:border-orange-400 outline-none transition-colors resize-none placeholder:text-slate-400"
              placeholder="Masukkan Deskripsi Produk"
            />
          </div>

          <div className="h-px bg-slate-100 mb-5" />

          {/* ═══════════════════════════════════════ */}
          {/* CATEGORY */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.kategori}
              onChange={(e) =>
                setFormData({ ...formData, kategori: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:ring-0 focus:border-orange-400 outline-none transition-colors appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              <option value="">-- Pilih Kategori --</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {storeCategory && (
              <p className="text-xs text-slate-400 mt-1.5">
                📦 Kategori toko Anda: {storeCategory.charAt(0).toUpperCase() + storeCategory.slice(1)}
              </p>
            )}
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* PRICE with Rp prefix */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Harga <span className="text-red-500">*</span>
            </label>
            <div className="flex border-[1.5px] border-slate-200 rounded-xl overflow-hidden focus-within:border-orange-400 transition-colors">
              <span className="bg-slate-50 border-r border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 flex items-center">
                Rp
              </span>
              <input
                type="text"
                value={formData.harga}
                onChange={(e) =>
                  setFormData({ ...formData, harga: formatPriceInput(e.target.value) })
                }
                required
                className="flex-1 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="50.000"
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* STOCK */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Stok
            </label>
            <input
              type="number"
              value={formData.stok}
              onChange={(e) =>
                setFormData({ ...formData, stok: e.target.value })
              }
              min="0"
              className="w-full px-4 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-0 focus:border-orange-400 outline-none transition-colors placeholder:text-slate-400"
              placeholder="Masukkan jumlah stok"
            />
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* VARIANT SECTION */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700">Varian Produk</label>
              <button
                type="button"
                onClick={() => {
                  setVariantsEnabled(!variantsEnabled);
                  if (!variantsEnabled && variantTypes.length === 0) {
                    addVariantType();
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${variantsEnabled ? 'bg-orange-500' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${variantsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {variantsEnabled && (
              <div className="space-y-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500">
                  Tambahkan varian seperti Warna, Ukuran, atau Jenis. Maksimal 2 tipe varian.
                </p>

                {variantTypes.map((vt, typeIndex) => (
                  <div key={typeIndex} className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
                    {/* Variant Type Header */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                        Varian {typeIndex + 1}
                      </span>
                      <input
                        type="text"
                        value={vt.name}
                        onChange={(e) => updateVariantTypeName(typeIndex, e.target.value)}
                        placeholder="Nama varian (cth: Warna, Ukuran)"
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-orange-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantType(typeIndex)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {vt.options.map((opt, optIndex) => (
                        <div key={optIndex} className="space-y-1">
                          <div className="flex items-center gap-2">
                            {/* Photo button only for 1st variant type */}
                            {typeIndex === 0 && (
                              <div className="relative">
                                {opt.imagePreview ? (
                                  <button
                                    type="button"
                                    onClick={() => setVariantActionPopup({ typeIndex, optIndex })}
                                    className="flex-shrink-0 w-9 h-9 rounded-lg border border-slate-200 overflow-hidden hover:ring-2 hover:ring-orange-300 transition-all"
                                  >
                                    <img src={opt.imagePreview} alt="" className="w-full h-full object-cover" />
                                  </button>
                                ) : (
                                  <label className="flex-shrink-0 w-9 h-9 rounded-lg border border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                                    <Camera className="size-4 text-slate-400" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      ref={el => { variantFileInputRefs.current[`${typeIndex}-${optIndex}`] = el; }}
                                      onChange={(e) => handleVariantImageChange(typeIndex, optIndex, e)}
                                      className="hidden"
                                    />
                                  </label>
                                )}

                                {/* Action Popup */}
                                {variantActionPopup?.typeIndex === typeIndex && variantActionPopup?.optIndex === optIndex && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setVariantActionPopup(null)} />
                                    <div className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-xl border border-slate-200 py-1 w-36 animate-in fade-in slide-in-from-top-1">
                                      <div className="px-3 py-1.5 border-b border-slate-100">
                                        <span className="text-xs font-semibold text-slate-700">Aksi</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVariantPreviewImage(opt.imagePreview || null);
                                          setVariantActionPopup(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <Eye className="size-4" /> Lihat
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVariantActionPopup(null);
                                          variantFileInputRefs.current[`${typeIndex}-${optIndex}`]?.click();
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <ImagePlus className="size-4" /> Ganti
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeVariantImage(typeIndex, optIndex)}
                                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <Trash2 className="size-4" /> Hapus
                                      </button>
                                    </div>
                                  </>
                                )}

                                {/* Hidden file input for "Ganti" action */}
                                {opt.imagePreview && (
                                  <input
                                    type="file"
                                    accept="image/*"
                                    ref={el => { variantFileInputRefs.current[`${typeIndex}-${optIndex}`] = el; }}
                                    onChange={(e) => handleVariantImageChange(typeIndex, optIndex, e)}
                                    className="hidden"
                                  />
                                )}
                              </div>
                            )}
                            <input
                              type="text"
                              value={opt.value}
                              onChange={(e) => updateVariantOption(typeIndex, optIndex, 'value', e.target.value)}
                              placeholder="Opsi (cth: Merah)"
                              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-orange-400 outline-none"
                            />
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                              <span className="bg-slate-50 px-2 py-1.5 text-xs text-slate-500 border-r border-slate-200">+Rp</span>
                              <input
                                type="text"
                                value={opt.price_adjustment}
                                onChange={(e) => updateVariantOption(typeIndex, optIndex, 'price_adjustment', formatPriceInput(e.target.value))}
                                placeholder="0"
                                className="w-20 px-2 py-1.5 text-sm outline-none"
                              />
                            </div>
                            <input
                              type="number"
                              value={opt.stock}
                              onChange={(e) => updateVariantOption(typeIndex, optIndex, 'stock', e.target.value)}
                              placeholder="Stok"
                              min="0"
                              className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-orange-400 outline-none"
                            />
                            {vt.options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariantOption(typeIndex, optIndex)}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Option Button */}
                    <button
                      type="button"
                      onClick={() => addVariantOption(typeIndex)}
                      className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <Plus className="size-3" /> Tambah Opsi
                    </button>
                  </div>
                ))}

                {/* Add Variant Type Button */}
                {variantTypes.length < 2 && (
                  <button
                    type="button"
                    onClick={addVariantType}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:text-orange-600 hover:border-orange-400 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="size-4" /> Tambah Tipe Varian
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* BUTTONS */}
          {/* ═══════════════════════════════════════ */}
          <div className="flex gap-3 justify-end pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-[1.5px] border-slate-300 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Simpan
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Tampilkan Produk"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Variant Image Preview Modal */}
      {variantPreviewImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setVariantPreviewImage(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setVariantPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg hover:bg-slate-100 transition-colors z-10"
            >
              <X className="size-5 text-slate-700" />
            </button>
            <img
              src={variantPreviewImage}
              alt="Preview Varian"
              className="w-full rounded-xl shadow-2xl object-contain max-h-[70vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
