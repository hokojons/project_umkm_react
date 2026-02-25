import React, { useState, useMemo, useEffect } from "react";
import { X, Upload, Loader, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";

// Product category mapping based on store category
const STORE_TO_PRODUCT_CATEGORIES: Record<string, string[]> = {
  "Fashion": ["Pakaian Pria", "Pakaian Wanita", "Pakaian Anak", "Sepatu", "Tas", "Aksesoris Fashion"],
  "Kerajinan": ["Dekorasi", "Furniture", "Aksesoris Rumah", "Perhiasan", "Souvenir", "Lainnya"],
  "Kuliner": ["Makanan Berat", "Makanan Ringan", "Snack", "Kue", "Dessert", "Minuman", "Frozen Food"],
  "Kecantikan": ["Skincare", "Makeup", "Perawatan Rambut", "Parfum", "Body Care", "Lainnya"],
  "Aksesoris": ["Perhiasan", "Gelang", "Kalung", "Cincin", "Anting", "Jam Tangan", "Lainnya"],
  "UMKM": ["Produk Umum", "Makanan", "Fashion", "Kerajinan", "Aksesoris", "Elektronik", "Lainnya"],
};

const DEFAULT_PRODUCT_CATEGORIES = ["Produk", "Makanan", "Aksesoris", "Kerajinan", "Lainnya"];

interface SubmitBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  stok: string;
  category: string;
  image: string;
  imageFile?: File;
}

export function SubmitBusinessModal({
  isOpen,
  onClose,
}: SubmitBusinessModalProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessData, setBusinessData] = useState({
    name: "",
    owner: "",
    description: "",
    about: "", // Add about field
    category: "Fashion",
    image: "",
    imageFile: null as File | null,
    dokumenPerjanjian: "",
    dokumenFile: null as File | null,
    whatsapp: "",
    email: "",
    instagram: "",
    paroki: "",
    umat: "",
    nama_bank: "",
    no_rekening: "",
    atas_nama: "",
    menyediakanJasaKirim: false,
  });
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "",
      description: "",
      price: "",
      stok: "",
      category: "",
      image: "",
    },
  ]);

  // Pre-fill WhatsApp and Email from user profile
  useEffect(() => {
    if (user && isOpen) {
      setBusinessData(prev => ({
        ...prev,
        owner: prev.owner || user.name || user.nama_lengkap || "",
        whatsapp: prev.whatsapp || user.no_telepon || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user, isOpen]);

  // Dynamic product categories based on store category
  const productCategoryOptions = useMemo(() => {
    return STORE_TO_PRODUCT_CATEGORIES[businessData.category] || DEFAULT_PRODUCT_CATEGORIES;
  }, [businessData.category]);

  if (!isOpen) return null;

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "business" | "product",
    productId?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    setIsUploading(type === "business" ? "business" : productId || null);

    try {
      // Store file object dan preview URL
      const previewUrl = URL.createObjectURL(file);

      if (type === "business") {
        setBusinessData((prev) => ({
          ...prev,
          image: previewUrl,
          imageFile: file,
        }));
      } else if (productId) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, image: previewUrl, imageFile: file }
              : p
          )
        );
      }

      toast.success("Gambar siap diupload!");
      setIsUploading(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Terjadi kesalahan saat upload");
      setIsUploading(null);
    }
  };

  const handleDokumenUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("File harus berupa PDF, DOC, DOCX, atau gambar");
      return;
    }

    setBusinessData(prev => ({
      ...prev,
      dokumenPerjanjian: file.name,
      dokumenFile: file,
    }));
    toast.success("Dokumen siap diupload!");
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: "",
      stok: "",
      category: "",
      image: "",
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (products.length === 1) {
      toast.error("Minimal harus ada 1 produk");
      return;
    }
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !businessData.name.trim() ||
      !businessData.owner.trim() ||
      !businessData.description.trim()
    ) {
      toast.error("Mohon lengkapi data toko");
      return;
    }

    if (!businessData.imageFile) {
      toast.error("Mohon upload logo/foto toko");
      return;
    }

    const invalidProduct = products.find(
      (p) =>
        !p.name.trim() ||
        !p.description.trim() ||
        !p.price ||
        Number(p.price) <= 0 ||
        !p.stok ||
        Number(p.stok) < 0
    );

    if (invalidProduct) {
      toast.error("Mohon lengkapi semua data produk");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      // Format WhatsApp number (ensure it starts with 62)
      let formattedWhatsapp = businessData.whatsapp.trim();
      if (formattedWhatsapp) {
        // Remove any + or spaces
        formattedWhatsapp = formattedWhatsapp.replace(/[\s+]/g, "");
        // If starts with 0, replace with 62
        if (formattedWhatsapp.startsWith("0")) {
          formattedWhatsapp = "62" + formattedWhatsapp.substring(1);
        }
        // If doesn't start with 62, add it
        if (!formattedWhatsapp.startsWith("62")) {
          formattedWhatsapp = "62" + formattedWhatsapp;
        }
      }

      // Submit to backend API using FormData
      const formData = new FormData();
      formData.append("nama_toko", businessData.name);
      formData.append("nama_pemilik", businessData.owner);
      formData.append("deskripsi", businessData.description);
      formData.append("kategori", businessData.category); // Send category name for backend mapping

      if (businessData.imageFile) {
        formData.append("foto_toko", businessData.imageFile);
      }

      // Append dokumen perjanjian if exists
      if (businessData.dokumenFile) {
        formData.append("dokumen_perjanjian", businessData.dokumenFile);
      }

      if (formattedWhatsapp) {
        formData.append("whatsapp", formattedWhatsapp);
      }
      if (businessData.email.trim()) {
        formData.append("email", businessData.email.trim());
      }
      if (businessData.instagram.trim()) {
        formData.append(
          "instagram",
          businessData.instagram.trim().replace("@", "")
        );
      }
      if (businessData.about.trim()) {
        formData.append("about_me", businessData.about.trim());
      }
      if (businessData.paroki.trim()) {
        formData.append("paroki", businessData.paroki.trim());
      }
      if (businessData.umat.trim()) {
        formData.append("umat", businessData.umat.trim());
      }
      if (businessData.nama_bank.trim()) {
        formData.append("nama_bank", businessData.nama_bank.trim());
      }
      if (businessData.no_rekening.trim()) {
        formData.append("no_rekening", businessData.no_rekening.trim());
      }
      if (businessData.atas_nama.trim()) {
        formData.append("atas_nama_rekening", businessData.atas_nama.trim());
      }
      formData.append("menyediakan_jasa_kirim", businessData.menyediakanJasaKirim ? "1" : "0");

      // Append products as JSON string
      const productsData = products.map((p, index) => ({
        nama_produk: p.name,
        deskripsi: p.description,
        harga: Number(p.price) || 0,
        stok: Number(p.stok) || 0,
        kategori: p.category,
      }));

      // Debug: log products data
      console.log("Products to submit:", productsData);
      console.log("Products JSON:", JSON.stringify(productsData));

      formData.append("produk", JSON.stringify(productsData));

      // Append product images
      products.forEach((p, index) => {
        if (p.imageFile) {
          formData.append(`produk_image_${index}`, p.imageFile);
        }
      });

      // Debug: Log all FormData entries
      console.log("=== FormData Debug ===");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, ":", value.name, `(${value.size} bytes)`);
        } else {
          console.log(key, ":", value);
        }
      }
      console.log("=== End FormData Debug ===");

      const response = await fetch(`${API_BASE_URL}/umkm/submit`, {
        method: "POST",
        headers: {
          "X-User-ID": user.id,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Log detailed error for debugging
        console.error("Submit error details:", data);
        console.error("Validation errors:", data.errors);

        // Show detailed validation errors
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('\n');
          toast.error(`Validation Error:\n${errorMessages}`);
        }

        throw new Error(data.message || "Gagal mengajukan toko");
      }

      toast.success("Toko berhasil diajukan! Menunggu persetujuan admin.");

      // Reset form
      setBusinessData({
        name: "",
        owner: "",
        description: "",
        about: "",
        category: "Fashion",
        image: "",
        imageFile: null,
        dokumenPerjanjian: "",
        dokumenFile: null,
        whatsapp: "",
        email: "",
        instagram: "",
        paroki: "",
        umat: "",
        nama_bank: "",
        no_rekening: "",
        atas_nama: "",
        menyediakanJasaKirim: false,
      });
      setProducts([
        {
          id: "1",
          name: "",
          description: "",
          price: "",
          stok: "",
          category: "",
          image: "",
        },
      ]);
      onClose();
    } catch (error) {
      console.error("Error submitting business:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8 p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="sticky top-0 right-0 float-right p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10 bg-white dark:bg-gray-800"
        >
          <X className="size-5" />
        </button>

        <h2 className="mb-6 text-gray-900 dark:text-white">Ajukan Toko/Stan UMKM</h2>

        {/* Demo Auto-Fill Button */}
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              const demoNames = [
                "Batik Nusantara", "Kopi Kita", "Warung Berkah", "Tenun Indah",
                "Roti Manis", "Keripik Sari", "Kerajinan Jaya", "Oleh-Oleh Khas",
                "Sambal Mbak Sri", "Es Teh Nusantara", "Kue Tradisional",
              ];
              const demoCategories = ["Fashion", "Makanan & Minuman", "Kerajinan", "Aksesoris", "UMKM"];
              const demoOwners = ["Budi Santoso", "Siti Rahayu", "Ahmad Fauzi", "Dewi Lestari", "Rizky Pratama"];
              const demoBanks = ["BCA", "BRI", "BNI", "Mandiri", "BSI"];
              const demoParoki = ["Santo Yosep", "Santa Maria", "Santo Petrus", "Kristus Raja", "Santo Paulus"];
              const randomPick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
              const randomNomor = () => String(Math.floor(1000000000 + Math.random() * 9000000000));
              const randomPhone = () => "628" + String(Math.floor(1000000000 + Math.random() * 9000000000));

              const owner = randomPick(demoOwners);
              setBusinessData({
                name: randomPick(demoNames),
                owner: owner,
                description: "Toko UMKM demo yang menjual berbagai produk berkualitas dengan harga terjangkau untuk masyarakat.",
                about: "Kami adalah UMKM lokal yang berdedikasi menyediakan produk terbaik. Didirikan dengan semangat kewirausahaan untuk memajukan ekonomi daerah.",
                category: randomPick(demoCategories),
                image: "",
                imageFile: null,
                dokumenPerjanjian: "",
                dokumenFile: null,
                whatsapp: randomPhone(),
                email: owner.toLowerCase().replace(/ /g, ".") + "@gmail.com",
                instagram: owner.toLowerCase().replace(/ /g, "_"),
                paroki: randomPick(demoParoki),
                umat: "Lingkungan " + randomPick(["St. Theresia", "St. Antonius", "St. Fransiskus", "St. Maria"]),
                nama_bank: randomPick(demoBanks),
                no_rekening: randomNomor(),
                atas_nama: owner,
                menyediakanJasaKirim: Math.random() > 0.5,
              });
              setProducts([{
                id: "1",
                name: "Produk Demo " + Math.floor(Math.random() * 100),
                description: "Produk unggulan dari toko kami dengan kualitas terbaik",
                price: String(Math.floor(10000 + Math.random() * 490000)),
                stok: String(Math.floor(5 + Math.random() * 95)),
                category: "Produk",
                image: "",
              }]);
              toast.success("Form terisi otomatis dengan data demo! 🎉");
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2 shadow-md"
          >
            🧪 Demo: Isi Otomatis
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Info Section */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <h3 className="mb-4 text-indigo-900 dark:text-indigo-300">Informasi Toko</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Logo/Foto Toko *</label>
                <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg p-4 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-gray-700">
                  {businessData.image ? (
                    <div className="space-y-3">
                      <img
                        src={businessData.image}
                        alt="Logo Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(businessData.image);
                          setBusinessData({
                            ...businessData,
                            image: "",
                            imageFile: null,
                          });
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="business-image"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "business")}
                        className="hidden"
                        disabled={isUploading === "business"}
                      />
                      <label
                        htmlFor="business-image"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        {isUploading === "business" ? (
                          <Loader className="size-12 text-indigo-600 animate-spin mb-3" />
                        ) : (
                          <Upload className="size-12 text-indigo-400 mb-3" />
                        )}
                        <span className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          {isUploading === "business"
                            ? "Uploading..."
                            : "Klik untuk upload logo"}
                        </span>
                        <span className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                          PNG, JPG hingga 2MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Nama Toko *</label>
                  <input
                    type="text"
                    value={businessData.name}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Contoh: Batik Nusantara"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Nama Pemilik *</label>
                  <input
                    type="text"
                    value={businessData.owner}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        owner: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Nama Anda"
                    required
                  />
                </div>
              </div>

              {/* Paroki and Umat Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Paroki / Gereja *
                  </label>
                  <input
                    type="text"
                    value={businessData.paroki}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, paroki: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Contoh: Paroki St. Yohanes Rasul"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Lingkungan / Umat *
                  </label>
                  <input
                    type="text"
                    value={businessData.umat}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, umat: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Contoh: Lingkungan St. Petrus"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Deskripsi Toko *</label>
                <textarea
                  value={businessData.description}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Ceritakan tentang toko Anda..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                  About Me / Tentang Pemilik
                </label>
                <textarea
                  value={businessData.about}
                  onChange={(e) =>
                    setBusinessData({ ...businessData, about: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Ceritakan tentang perjalanan Anda, visi, misi, atau cerita di balik UMKM Anda... (Opsional)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Bagian ini akan ditampilkan kepada pembeli untuk mengenal
                  lebih dekat tentang Anda dan UMKM Anda
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Kategori Toko *</label>
                <select
                  value={businessData.category}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="Fashion">Fashion</option>
                  <option value="Kerajinan">Kerajinan</option>
                  <option value="Kuliner">Kuliner</option>
                  <option value="Kecantikan">Kecantikan</option>
                  <option value="Aksesoris">Aksesoris</option>
                  <option value="UMKM">UMKM (Multi-produk)</option>
                </select>
              </div>

              {/* Delivery Option */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={businessData.menyediakanJasaKirim}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        menyediakanJasaKirim: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      🚚 Menyediakan Jasa Pengiriman
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Centang jika toko Anda bisa mengirim produk ke lokasi pembeli
                    </p>
                  </div>
                </label>
              </div>
              {/* Contact Information Section */}
              <div className="border-t border-indigo-200 dark:border-indigo-700 pt-4 mt-2">
                <h4 className="text-sm mb-3 text-indigo-900 dark:text-indigo-300">
                  Informasi Kontak (Opsional)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Tambahkan kontak Anda agar pembeli dapat menghubungi Anda
                  dengan mudah
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">WhatsApp</label>
                    <input
                      type="text"
                      value={businessData.whatsapp}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          whatsapp: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="628123456789"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Format: 628xxx (tanpa +)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      value={businessData.email}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Instagram</label>
                    <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Instagram</label>
                    <input
                      type="text"
                      value={businessData.instagram}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          instagram: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="username"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tanpa @ di depan
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Account Information Section */}
              <div className="border-t border-green-200 dark:border-green-700 pt-4 mt-2">
                <h4 className="text-sm mb-3 text-green-800 dark:text-green-300 flex items-center gap-2">
                  💳 Informasi Rekening Bank
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Info rekening akan ditampilkan ke pembeli agar mereka bisa transfer pembayaran
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Nama Bank</label>
                    <input
                      type="text"
                      value={businessData.nama_bank}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          nama_bank: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="BCA, BNI, Mandiri..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">No. Rekening</label>
                    <input
                      type="text"
                      value={businessData.no_rekening}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          no_rekening: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Atas Nama</label>
                    <input
                      type="text"
                      value={businessData.atas_nama}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          atas_nama: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Nama Pemilik Rekening"
                    />
                  </div>
                </div>
              </div>

              {/* Dokumen Perjanjian Section */}
              <div className="border-t border-orange-200 dark:border-orange-700 pt-4 mt-2">
                <h4 className="text-sm mb-3 text-orange-800 dark:text-orange-300 flex items-center gap-2">
                  📄 Dokumen Perjanjian (Wajib)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Silakan download template perjanjian, isi dan tanda tangani, kemudian upload kembali dokumen yang sudah ditandatangani.
                </p>

                {/* Download PDF Template Button */}
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📥</span>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          Template Surat Perjanjian
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Download, isi, dan tanda tangani dokumen ini
                        </p>
                      </div>
                    </div>
                    <a
                      href="/documents/template_perjanjian_umkm.pdf"
                      download="Template_Perjanjian_UMKM.pdf"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </a>
                  </div>
                </div>

                {/* Upload Signed Document */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  Upload dokumen yang sudah ditandatangani:
                </p>
                <div className="border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-lg p-4 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors bg-white dark:bg-gray-700">
                  {businessData.dokumenPerjanjian ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        ✅ {businessData.dokumenPerjanjian}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBusinessData({ ...businessData, dokumenPerjanjian: "", dokumenFile: null })}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="dokumen-perjanjian"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleDokumenUpload}
                        className="hidden"
                      />
                      <label htmlFor="dokumen-perjanjian" className="cursor-pointer flex flex-col items-center">
                        <Upload className="size-10 text-orange-400 mb-2" />
                        <span className="text-orange-600 dark:text-orange-400 hover:underline">
                          Klik untuk upload dokumen yang sudah ditandatangani
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          PDF, DOC, DOCX, atau gambar (max 10MB)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white">Produk yang Dijual</h3>
              <button
                type="button"
                onClick={addProduct}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
              >
                <Plus className="size-4" />
                Tambah Produk
              </button>
            </div>

            <div className="space-y-4">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 relative bg-white dark:bg-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm text-gray-900 dark:text-white">Produk {index + 1}</h4>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Foto Produk</label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-gray-600">
                        {product.image ? (
                          <div className="space-y-2">
                            <img
                              src={product.image}
                              alt="Product Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateProduct(product.id, "image", "")
                              }
                              className="text-xs text-red-600 hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              id={`product-image-${product.id}`}
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(e, "product", product.id)
                              }
                              className="hidden"
                              disabled={isUploading === product.id}
                            />
                            <label
                              htmlFor={`product-image-${product.id}`}
                              className="cursor-pointer flex flex-col items-center"
                            >
                              {isUploading === product.id ? (
                                <Loader className="size-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-2" />
                              ) : (
                                <Upload className="size-8 text-gray-400 dark:text-gray-500 mb-2" />
                              )}
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                Upload foto
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                          Nama Produk *
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) =>
                            updateProduct(product.id, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          placeholder="Nama produk"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                            Harga (Rp) *
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={product.price ? parseInt(product.price).toLocaleString('id-ID') : ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              updateProduct(product.id, "price", val);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            placeholder="Contoh: 50.000"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                            Stok *
                          </label>
                          <input
                            type="number"
                            value={product.stok}
                            onChange={(e) =>
                              updateProduct(product.id, "stok", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            placeholder="100"
                            min="0"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                            Kategori *
                          </label>
                          <select
                            value={product.category}
                            onChange={(e) =>
                              updateProduct(
                                product.id,
                                "category",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">Pilih Kategori</option>
                            {productCategoryOptions.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Deskripsi *</label>
                    <textarea
                      value={product.description}
                      onChange={(e) =>
                        updateProduct(product.id, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      rows={2}
                      placeholder="Deskripsi produk..."
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-900 dark:text-yellow-300">
              <strong>Catatan:</strong> Toko dan produk yang Anda ajukan akan
              ditinjau oleh admin. Setelah disetujui, toko Anda akan muncul di
              marketplace dan semua produk dapat langsung dijual.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading !== null}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Mengirim..." : "Ajukan Toko & Produk"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
