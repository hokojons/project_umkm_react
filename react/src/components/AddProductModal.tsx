import { useState } from "react";
import { X, Plus, Upload, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import type { ChangeEvent, FormEvent } from "react";

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
  const [formData, setFormData] = useState({
    nama_produk: "",
    harga: "",
    deskripsi: "",
    stok: "",
    kategori: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      formDataToSend.append("harga", formData.harga);
      formDataToSend.append("deskripsi", formData.deskripsi);
      formDataToSend.append("stok", formData.stok || "0");
      formDataToSend.append("kategori", formData.kategori);

      if (imageFile) {
        formDataToSend.append("gambar", imageFile);
      }

      const response = await fetch("http://localhost:8000/api/umkm/add-product", {
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
      setImageFile(null);
      setImagePreview("");
      
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
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Plus className="size-6 text-indigo-600" />
            Tambah Produk Baru
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Foto Produk
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="size-12 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600">
                    Klik untuk upload foto
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nama Produk *
            </label>
            <input
              type="text"
              value={formData.nama_produk}
              onChange={(e) =>
                setFormData({ ...formData, nama_produk: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Masukkan nama produk"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Harga *
            </label>
            <input
              type="number"
              value={formData.harga}
              onChange={(e) =>
                setFormData({ ...formData, harga: e.target.value })
              }
              required
              min="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Masukkan harga"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Stok
            </label>
            <input
              type="number"
              value={formData.stok}
              onChange={(e) =>
                setFormData({ ...formData, stok: e.target.value })
              }
              min="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Masukkan jumlah stok"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Kategori
            </label>
            <input
              type="text"
              value={formData.kategori}
              onChange={(e) =>
                setFormData({ ...formData, kategori: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Masukkan kategori produk"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Masukkan deskripsi produk"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="size-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="size-5" />
                  Tambah Produk
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
