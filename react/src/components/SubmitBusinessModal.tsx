import { useState } from "react";
import { X, Upload, Loader, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

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
    whatsapp: "",
    phone: "",
    email: "",
    instagram: "",
  });
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "",
      description: "",
      price: "",
      stok: "",
      category: "product",
      image: "",
    },
  ]);

  if (!isOpen) return null;

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "business" | "product",
    productId?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
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

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: "",
      category: "product",
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
      formData.append("kategori_id", "1"); // Default category

      if (businessData.imageFile) {
        formData.append("foto_toko", businessData.imageFile);
      }

      if (formattedWhatsapp) {
        formData.append("whatsapp", formattedWhatsapp);
      }
      if (businessData.phone.trim()) {
        formData.append("telepon", businessData.phone.trim());
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

      const response = await fetch("http://localhost:8000/api/umkm/submit", {
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
        whatsapp: "",
        phone: "",
        email: "",
        instagram: "",
      });
      setProducts([
        {
          id: "1",
          name: "",
          description: "",
          price: "",
          category: "product",
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

        <h2 className="mb-6">Ajukan Toko/Stan UMKM</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Info Section */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="mb-4 text-indigo-900">Informasi Toko</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Logo/Foto Toko *</label>
                <div className="border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
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
                        <span className="text-indigo-600 hover:underline">
                          {isUploading === "business"
                            ? "Uploading..."
                            : "Klik untuk upload logo"}
                        </span>
                        <span className="text-xs text-indigo-700 mt-1">
                          PNG, JPG hingga 5MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Nama Toko *</label>
                  <input
                    type="text"
                    value={businessData.name}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: Batik Nusantara"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Nama Pemilik *</label>
                  <input
                    type="text"
                    value={businessData.owner}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        owner: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nama Anda"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Deskripsi Toko *</label>
                <textarea
                  value={businessData.description}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Ceritakan tentang toko Anda..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  About Me / Tentang Pemilik
                </label>
                <textarea
                  value={businessData.about}
                  onChange={(e) =>
                    setBusinessData({ ...businessData, about: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Ceritakan tentang perjalanan Anda, visi, misi, atau cerita di balik UMKM Anda... (Opsional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bagian ini akan ditampilkan kepada pembeli untuk mengenal
                  lebih dekat tentang Anda dan UMKM Anda
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2">Kategori Toko *</label>
                <select
                  value={businessData.category}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

              {/* Contact Information Section */}
              <div className="border-t border-indigo-200 pt-4 mt-2">
                <h4 className="text-sm mb-3 text-indigo-900">
                  Informasi Kontak (Opsional)
                </h4>
                <p className="text-xs text-gray-600 mb-4">
                  Tambahkan kontak Anda agar pembeli dapat menghubungi Anda
                  dengan mudah
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">WhatsApp</label>
                    <input
                      type="text"
                      value={businessData.whatsapp}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
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
                    <label className="block text-sm mb-2">Telepon</label>
                    <input
                      type="text"
                      value={businessData.phone}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="081234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={businessData.email}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Instagram</label>
                    <input
                      type="text"
                      value={businessData.instagram}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          instagram: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="username"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tanpa @ di depan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3>Produk yang Dijual</h3>
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
                  className="border border-gray-200 rounded-lg p-4 relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm">Produk {index + 1}</h4>
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
                      <label className="block text-sm mb-2">Foto Produk</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-indigo-400 transition-colors">
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
                                <Loader className="size-8 text-indigo-600 animate-spin mb-2" />
                              ) : (
                                <Upload className="size-8 text-gray-400 mb-2" />
                              )}
                              <span className="text-xs text-indigo-600 hover:underline">
                                Upload foto
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1">
                          Nama Produk *
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) =>
                            updateProduct(product.id, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Nama produk"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm mb-1">
                            Harga (Rp) *
                          </label>
                          <input
                            type="number"
                            value={product.price}
                            onChange={(e) =>
                              updateProduct(product.id, "price", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="50000"
                            min="0"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">
                            Stok *
                          </label>
                          <input
                            type="number"
                            value={product.stok}
                            onChange={(e) =>
                              updateProduct(product.id, "stok", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="100"
                            min="0"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          >
                            <option value="product">Produk</option>
                            <option value="food">Makanan</option>
                            <option value="accessory">Aksesoris</option>
                            <option value="craft">Kerajinan</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm mb-1">Deskripsi *</label>
                    <textarea
                      value={product.description}
                      onChange={(e) =>
                        updateProduct(product.id, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                      placeholder="Deskripsi produk..."
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-900">
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
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
