import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

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
}

export function GiftPackageManagement() {
  const [packages, setPackages] = useState<GiftPackage[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");  const [formData, setFormData] = useState<Partial<GiftPackage>>({
    name: "",
    description: "",
    price: 0,
    stok: 100,
    category: "Lebaran",
    image: "",
    items: [""],
  });

  // Predefined package templates
  const packageTemplates = [
    {
      name: "Paket Lebaran Berkah",
      description: "Paket lengkap untuk perayaan Lebaran yang penuh berkah",
      price: 350000,
      category: "Lebaran",
      items: [
        "Mukena batik eksklusif",
        "Kue kering premium 3 toples",
        "Kurma mewah",
        "Tas goodie bag cantik",
      ],
    },
    {
      name: "Paket Hantaran Pernikahan",
      description: "Paket hantaran eksklusif untuk pernikahan impian",
      price: 500000,
      category: "Pernikahan",
      items: [
        "Kotak seserahan ukiran kayu",
        "Batik couple premium",
        "Perhiasan emas tiruan",
        "Kue pengantin",
      ],
    },
    {
      name: "Paket Korporat Eksklusif",
      description: "Hadiah sempurna untuk relasi bisnis dan klien",
      price: 450000,
      category: "Korporat",
      items: [
        "Tas kulit handmade",
        "Produk kecantikan organik",
        "Kopi premium specialty",
        "Snack box mewah",
      ],
    },
    {
      name: "Paket Ramadan Berbagi",
      description: "Paket berbagi kebaikan di bulan Ramadan",
      price: 200000,
      category: "Ramadan",
      items: [
        "Sajadah travel",
        "Tasbih kayu jati",
        "Kurma dan kue kering",
        "Al-Quran mini",
      ],
    },
    {
      name: "Paket Wisuda Champion",
      description: "Rayakan pencapaian dengan paket wisuda spesial",
      price: 275000,
      category: "Wisuda",
      items: [
        "Buket bunga artificial",
        "Boneka wisuda custom",
        "Aksesoris fashion",
        "Coklat premium",
      ],
    },
    {
      name: "Paket Baby Born Celebration",
      description: "Sambut kelahiran buah hati dengan paket istimewa",
      price: 300000,
      category: "Baby",
      items: [
        "Set pakaian bayi handmade",
        "Hampers kado bayi",
        "Produk organic baby care",
        "Kue & snack untuk tamu",
      ],
    },
    {
      name: "Paket Arisan Special",
      description: "Hadiah arisan yang berkesan dan berkelas",
      price: 180000,
      category: "Arisan",
      items: [
        "Tas rajut trendy",
        "Aksesoris hijab",
        "Snack kekinian",
        "Parfum lokal",
      ],
    },
    {
      name: "Paket Nusantara Heritage",
      description: "Koleksi produk unggulan warisan Nusantara",
      price: 400000,
      category: "Heritage",
      items: [
        "Batik tulis asli",
        "Kerajinan rotan premium",
        "Kopi & teh nusantara",
        "Jajanan tradisional modern",
      ],
    },
  ];

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/gift-packages');
      const data = await response.json();
      
      if (data.success) {
        setPackages(data.data);
      } else {
        toast.error('Gagal memuat paket hadiah');
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      toast.error('Gagal memuat paket hadiah');
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
    if (!formData.name || !formData.description || !formData.price || !formData.stok) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stok', formData.stok.toString());
      formDataToSend.append('category', formData.category || 'Lainnya');
      
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

      const response = await fetch('http://localhost:8000/api/gift-packages', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        await loadPackages();
        setIsCreating(false);
        setImageFile(null);
        setImagePreview("");
        setFormData({
          name: "",
          description: "",
          price: 0,
          stok: 100,
          category: "Lebaran",
          image: "",
          items: [""],
        });
        toast.success("Paket hadiah berhasil dibuat!");
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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('_method', 'PUT'); // Laravel form method spoofing
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('price', (formData.price || 0).toString());
      formDataToSend.append('stok', (formData.stok || 0).toString());
      formDataToSend.append('category', formData.category || 'Lainnya');
      
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

      const response = await fetch(`http://localhost:8000/api/gift-packages/${editingId}`, {
        method: 'POST', // Use POST with _method=PUT for FormData
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        await loadPackages();
        setEditingId(null);        setImageFile(null);
        setImagePreview("");        setFormData({
          name: "",
          description: "",
          price: 0,
          stok: 100,
          category: "Lebaran",
          image: "",
          items: [""],
        });
        toast.success("Paket hadiah berhasil diupdate!");
      } else {
        toast.error(data.message || 'Gagal mengupdate paket hadiah');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Gagal mengupdate paket hadiah');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus paket hadiah ini?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/gift-packages/${id}`, {
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
      category: pkg.category,
      image: pkg.image,
      items: pkg.items.length > 0 ? pkg.items : [""],
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
    });
    setIsCreating(true);
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

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900">Manajemen Paket Hadiah</h3>
          <p className="text-sm text-slate-500 mt-1">
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
              category: "Lebaran",
              image: "",
              items: [""],
            });
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
        >
          <Plus className="size-4" />
          Buat Paket Baru
        </button>
      </div>

      {/* Templates Section */}
      {isCreating && !editingId && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-sm text-indigo-900 mb-3">
            Template Paket Hadiah
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {packageTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleUseTemplate(template)}
                className="text-left p-3 bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-500 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                <p className="text-sm font-medium text-slate-900">
                  {template.name}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {formatCurrency(template.price)}
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-indigo-700 mt-3">
            💡 Klik template untuk mulai dengan data awal
          </p>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-slate-900">
              {editingId ? "Edit Paket Hadiah" : "Buat Paket Hadiah Baru"}
            </h4>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setFormData({
                  name: "",
                  description: "",
                  price: 0,
                  category: "Lebaran",
                  image: "",
                  items: [""],
                });
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Nama Paket *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Paket Lebaran Berkah"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Kategori *</label>
                <select
                  value={formData.category || "Lebaran"}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Lebaran">Lebaran</option>
                  <option value="Ramadan">Ramadan</option>
                  <option value="Pernikahan">Pernikahan</option>
                  <option value="Korporat">Korporat</option>
                  <option value="Wisuda">Wisuda</option>
                  <option value="Baby">Baby</option>
                  <option value="Arisan">Arisan</option>
                  <option value="Heritage">Heritage</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Deskripsi *</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                rows={3}
                placeholder="Deskripsi lengkap paket hadiah..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Harga (Rp) *</label>
                <input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="350000"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Stok *</label>
                <input
                  type="number"
                  value={formData.stok || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, stok: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Gambar Paket</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Upload dari Device
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="text-center text-xs text-slate-500">
                  ATAU
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    URL Gambar
                  </label>
                  <input
                    type="text"
                    value={formData.image || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm">Item dalam Paket *</label>
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
                      onChange={(e) => updateItem(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder={`Item ${index + 1}`}
                    />
                    {(formData.items || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm"
              >
                <Save className="size-4" />
                {editingId ? "Simpan Perubahan" : "Buat Paket"}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setFormData({
                    name: "",
                    description: "",
                    price: 0,
                    category: "Lebaran",
                    image: "",
                    items: [""],
                  });
                }}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {pkg.image && (
              <img
                src={
                  pkg.image.startsWith('http://') || pkg.image.startsWith('https://')
                    ? pkg.image
                    : `http://localhost:8000/${pkg.image}`
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
                  <h4 className="text-slate-900 mb-1">{pkg.name}</h4>
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                    {pkg.category}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {pkg.description}
              </p>

              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2">Isi paket:</p>
                <ul className="space-y-1">
                  {pkg.items.slice(0, 3).map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-600 flex items-start gap-2"
                    >
                      <span className="text-indigo-600">•</span>
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                  {pkg.items.length > 3 && (
                    <li className="text-xs text-slate-400 italic">
                      +{pkg.items.length - 3} item lainnya
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="font-medium text-indigo-600">
                  {formatCurrency(pkg.price)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
          <p className="text-slate-500 mb-4">Belum ada paket hadiah</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2 text-sm"
          >
            <Plus className="size-4" />
            Buat Paket Pertama
          </button>
        </div>
      )}
    </div>
  );
}
