# Edit UMKM + WhatsApp/Instagram Integration - COMPLETE ✅

**Tanggal**: 21 Desember 2025  
**Status**: ✅ SELESAI & BERFUNGSI

---

## 📋 FITUR YANG DIIMPLEMENTASIKAN

### 1. ✏️ Edit Toko UMKM

- Button edit (biru) di dashboard untuk setiap toko
- Modal edit dengan form lengkap:
  - Nama Toko
  - Nama Pemilik
  - Deskripsi
  - Upload Foto Toko (max 5MB, convert ke base64)
  - WhatsApp
  - Instagram
  - About Me (textarea)
- Save ke backend Laravel API

### 2. ✏️ Edit Produk

- Button edit di setiap produk card
- Modal edit produk dengan form:
  - Nama Produk
  - Deskripsi
  - Harga
  - Kategori
  - Upload Gambar Produk (max 5MB, base64)
- Update langsung ke database via API

### 3. 📱 WhatsApp & Instagram Icons

- Icon hijau WhatsApp dengan link `https://wa.me/{whatsapp}`
- Icon gradient pink-purple Instagram dengan link `https://instagram.com/{instagram}`
- Tampil di:
  - **StandCard.tsx**: Di bawah deskripsi toko
  - **MenuModal.tsx**: Di header modal dan section contact

---

## 🗄️ DATABASE CHANGES

### Migration File Baru

**File**: `Laravel/database/migrations/2025_12_21_140000_add_about_me_to_tumkm_table.php`

```php
Schema::table('tumkm', function (Blueprint $table) {
    $table->text('about_me')->nullable()->after('instagram');
});
```

**Command**:

```bash
php artisan migrate
```

### Struktur Tabel `tumkm` (Final)

```
- id (auto increment)
- user_id (FK to users)
- nama_toko
- nama_pemilik
- deskripsi
- foto_toko (longText - base64)
- kategori_id (FK to categories)
- whatsapp (varchar 20)
- telepon (varchar 20)
- email (varchar 255)
- instagram (varchar 100)
- about_me (text) ← BARU
- alamat (varchar 200)
- kota (varchar 100)
- kode_pos (varchar 10)
- status (enum)
- created_at
- updated_at
```

---

## 🔧 BACKEND (Laravel)

### 1. Model Update

**File**: `Laravel/app/Models/Tumkm.php`

```php
protected $fillable = [
    'user_id',
    'nama_toko',
    'nama_pemilik',
    'deskripsi',
    'foto_toko',
    'kategori_id',
    'whatsapp',
    'telepon',
    'email',
    'instagram',
    'alamat',
    'kota',
    'kode_pos',
    'about_me',  // ← DITAMBAHKAN
    'status',
];
```

### 2. API Routes

**File**: `Laravel/routes/api.php`

```php
Route::prefix('umkm')->group(function () {
    // ... existing routes
    Route::put('/{id}', [UmkmController::class, 'updateStore']);
    Route::put('/product/{id}', [UmkmController::class, 'updateProduct']);
});
```

### 3. Controller Methods

**File**: `Laravel/app/Http/Controllers/Api/UmkmController.php`

#### `updateStore()` Method

```php
public function updateStore(Request $request, $id)
{
    $userId = $request->header('X-User-ID');

    // Verify ownership
    $umkm = Tumkm::where('id', $id)
        ->where('user_id', $userId)
        ->first();

    if (!$umkm) {
        return response()->json([
            'success' => false,
            'message' => 'UMKM store not found or unauthorized'
        ], 404);
    }

    // Validation
    $validator = Validator::make($request->all(), [
        'nama_toko' => 'nullable|string|max:255',
        'nama_pemilik' => 'nullable|string|max:255',
        'deskripsi' => 'nullable|string',
        'foto_toko' => 'nullable|string',
        'whatsapp' => 'nullable|string|max:20',
        'telepon' => 'nullable|string|max:20',
        'email' => 'nullable|email|max:255',
        'instagram' => 'nullable|string|max:100',
        'about_me' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    // Update fields
    $updateData = array_filter([
        'nama_toko' => $request->nama_toko,
        'nama_pemilik' => $request->nama_pemilik,
        'deskripsi' => $request->deskripsi,
        'foto_toko' => $request->foto_toko,
        'whatsapp' => $request->whatsapp,
        'telepon' => $request->telepon,
        'email' => $request->email,
        'instagram' => $request->instagram,
        'about_me' => $request->about_me,
    ], function ($value) {
        return $value !== null;
    });

    $umkm->update($updateData);

    return response()->json([
        'success' => true,
        'message' => 'Store updated successfully',
        'data' => $umkm->load('category')
    ], 200);
}
```

#### `updateProduct()` Method

```php
public function updateProduct(Request $request, $id)
{
    $userId = $request->header('X-User-ID');

    // Find product
    $product = Tproduk::find($id);

    if (!$product) {
        return response()->json([
            'success' => false,
            'message' => 'Product not found'
        ], 404);
    }

    // Verify ownership through UMKM
    $umkm = Tumkm::where('id', $product->umkm_id)
        ->where('user_id', $userId)
        ->first();

    if (!$umkm) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized to update this product'
        ], 403);
    }

    // Validation
    $validator = Validator::make($request->all(), [
        'nama_produk' => 'nullable|string|max:255',
        'deskripsi' => 'nullable|string',
        'harga' => 'nullable|numeric|min:0',
        'kategori' => 'nullable|string|max:50',
        'gambar' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    // Update
    $updateData = array_filter([
        'nama_produk' => $request->nama_produk,
        'deskripsi' => $request->deskripsi,
        'harga' => $request->harga,
        'kategori' => $request->kategori,
        'gambar' => $request->gambar,
    ], function ($value) {
        return $value !== null;
    });

    $product->update($updateData);

    return response()->json([
        'success' => true,
        'message' => 'Product updated successfully',
        'data' => $product
    ], 200);
}
```

---

## 💻 FRONTEND (React)

### 1. UMKMDashboard.tsx

#### State Management

```typescript
const [editingBusiness, setEditingBusiness] = useState<any>(null);
const [editingProduct, setEditingProduct] = useState<any>(null);
const [isUploading, setIsUploading] = useState(false);
```

#### Image Upload Handler

```typescript
const handleImageUpload = (
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
  const reader = new FileReader();

  reader.onloadend = () => {
    const base64String = reader.result as string;

    if (type === "business") {
      setEditingBusiness({
        ...editingBusiness,
        foto_toko: base64String,
      });
    } else {
      setEditingProduct({
        ...editingProduct,
        gambar: base64String,
      });
    }
    setIsUploading(false);
    toast.success("Gambar berhasil diupload");
  };

  reader.onerror = () => {
    setIsUploading(false);
    toast.error("Gagal upload gambar");
  };

  reader.readAsDataURL(file);
};
```

#### Update Business Handler

```typescript
const handleUpdateBusiness = async () => {
  if (!editingBusiness || !user) return;

  try {
    const response = await fetch(
      `http://localhost:8000/api/umkm/${editingBusiness.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": user.id.toString(),
        },
        body: JSON.stringify({
          nama_toko: editingBusiness.nama_toko,
          nama_pemilik: editingBusiness.nama_pemilik,
          deskripsi: editingBusiness.deskripsi,
          foto_toko: editingBusiness.foto_toko,
          whatsapp: editingBusiness.whatsapp,
          instagram: editingBusiness.instagram,
          about_me: editingBusiness.about_me,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      toast.success("Toko berhasil diupdate!");
      setEditingBusiness(null);
      fetchData(); // Reload data
    } else {
      toast.error(data.message || "Gagal update toko");
    }
  } catch (error) {
    console.error("Error updating business:", error);
    toast.error("Terjadi kesalahan saat update toko");
  }
};
```

#### Update Product Handler

```typescript
const handleUpdateProduct = async () => {
  if (!editingProduct || !user) return;

  try {
    const response = await fetch(
      `http://localhost:8000/api/umkm/product/${editingProduct.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": user.id.toString(),
        },
        body: JSON.stringify({
          nama_produk: editingProduct.nama_produk,
          deskripsi: editingProduct.deskripsi,
          harga: editingProduct.harga,
          kategori: editingProduct.kategori,
          gambar: editingProduct.gambar,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      toast.success("Produk berhasil diupdate!");
      setEditingProduct(null);
      fetchData();
    } else {
      toast.error(data.message || "Gagal update produk");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Terjadi kesalahan saat update produk");
  }
};
```

#### Edit Business Modal JSX

```typescript
{
  editingBusiness && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Edit Toko</h3>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Foto Toko</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "business")}
            className="w-full border rounded p-2"
            disabled={isUploading}
          />
          {editingBusiness.foto_toko && (
            <img
              src={editingBusiness.foto_toko}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nama Toko"
            value={editingBusiness.nama_toko}
            onChange={(e) =>
              setEditingBusiness({
                ...editingBusiness,
                nama_toko: e.target.value,
              })
            }
            className="w-full border rounded p-2"
          />

          <input
            type="text"
            placeholder="Nama Pemilik"
            value={editingBusiness.nama_pemilik}
            onChange={(e) =>
              setEditingBusiness({
                ...editingBusiness,
                nama_pemilik: e.target.value,
              })
            }
            className="w-full border rounded p-2"
          />

          <textarea
            placeholder="Deskripsi"
            value={editingBusiness.deskripsi}
            onChange={(e) =>
              setEditingBusiness({
                ...editingBusiness,
                deskripsi: e.target.value,
              })
            }
            className="w-full border rounded p-2"
            rows={3}
          />

          <input
            type="text"
            placeholder="WhatsApp (contoh: 628123456789)"
            value={editingBusiness.whatsapp || ""}
            onChange={(e) =>
              setEditingBusiness({
                ...editingBusiness,
                whatsapp: e.target.value,
              })
            }
            className="w-full border rounded p-2"
          />

          <input
            type="text"
            placeholder="Instagram (username saja)"
            value={editingBusiness.instagram || ""}
            onChange={(e) =>
              setEditingBusiness({
                ...editingBusiness,
                instagram: e.target.value,
              })
            }
            className="w-full border rounded p-2"
          />

          <textarea
            placeholder="Tentang Saya"
            value={editingBusiness.about_me || ""}
            onChange={(e) =>
              setEditingBusiness({
                ...editingBusiness,
                about_me: e.target.value,
              })
            }
            className="w-full border rounded p-2"
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleUpdateBusiness}
            disabled={isUploading}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Simpan"}
          </button>
          <button
            onClick={() => setEditingBusiness(null)}
            disabled={isUploading}
            className="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 2. StandCard.tsx - WhatsApp & Instagram Icons

```typescript
{
  /* Contact Icons */
}
<div className="flex gap-2 mt-3">
  {stand.whatsapp && (
    <a
      href={`https://wa.me/${stand.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition-colors"
    >
      <MessageCircle className="w-3 h-3" />
      <span>WhatsApp</span>
    </a>
  )}
  {stand.instagram && (
    <a
      href={`https://instagram.com/${stand.instagram}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs hover:from-purple-600 hover:to-pink-600 transition-colors"
    >
      <Instagram className="w-3 h-3" />
      <span>Instagram</span>
    </a>
  )}
</div>;
```

### 3. MenuModal.tsx - Header Social Icons

```typescript
{
  /* Quick Access Icons */
}
<div className="flex gap-2">
  {business.whatsapp && (
    <a
      href={`https://wa.me/${business.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
    >
      <MessageCircle className="w-3 h-3" />
      <span className="hidden sm:inline">WA</span>
    </a>
  )}
  {business.instagram && (
    <a
      href={`https://instagram.com/${business.instagram}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs hover:from-purple-600 hover:to-pink-600"
    >
      <Instagram className="w-3 h-3" />
      <span className="hidden sm:inline">IG</span>
    </a>
  )}
</div>;
```

### 4. App.tsx - Data Mapping

```typescript
const loadBusinesses = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/umkm");
    const data = await response.json();

    if (data.success) {
      const transformedData: UMKMBusiness[] = data.data.map((umkm: any) => ({
        id: umkm.id,
        name: umkm.nama_toko,
        owner: umkm.nama_pemilik,
        description: umkm.deskripsi,
        category: umkm.category?.nama || "Tidak ada kategori",
        image: umkm.foto_toko || "/default-store.jpg",
        whatsapp: umkm.whatsapp, // ← MAPPED
        instagram: umkm.instagram, // ← MAPPED
        about: umkm.about_me, // ← MAPPED
        menu:
          umkm.products?.map((product: any) => ({
            id: product.id,
            name: product.nama_produk,
            price: product.harga,
            description: product.deskripsi,
            category: product.kategori,
            image: product.gambar || "/default-product.jpg",
          })) || [],
      }));

      setStands(transformedData);
    }
  } catch (error) {
    console.error("Error loading businesses:", error);
  }
};
```

---

## 🔐 AUTHENTICATION & SECURITY

### Ownership Validation

- Frontend mengirim `X-User-ID` header pada setiap request
- Backend memverifikasi ownership sebelum allow update:
  ```php
  $umkm = Tumkm::where('id', $id)
      ->where('user_id', $userId)
      ->first();
  ```
- Jika bukan pemilik → **403 Unauthorized** atau **404 Not Found**

### Image Upload Security

- Max file size: **5MB**
- Client-side validation sebelum upload
- Convert ke base64 untuk storage di database
- Preview image sebelum save

---

## 📝 USER WORKFLOW

### Edit Toko:

1. User masuk ke **Dashboard UMKM**
2. Klik button **Edit** (biru) pada toko mereka
3. Modal terbuka dengan data toko saat ini
4. User bisa ubah:
   - Foto toko (upload gambar baru)
   - Nama toko, nama pemilik, deskripsi
   - WhatsApp number (format: 628xxx)
   - Instagram username (tanpa @)
   - About Me (cerita tentang toko)
5. Klik **Simpan** → Data langsung update ke database
6. Toast notification: "Toko berhasil diupdate!"
7. Dashboard refresh otomatis

### Edit Produk:

1. Di dashboard, klik **Edit** pada produk card
2. Modal edit produk terbuka
3. User ubah nama, deskripsi, harga, kategori, gambar
4. Klik **Simpan** → Update ke database
5. Toast: "Produk berhasil diupdate!"
6. Data refresh

### Social Media Icons:

1. User yang sudah isi WhatsApp/Instagram akan lihat icon di:
   - **StandCard**: Icon WA hijau + IG gradient
   - **MenuModal**: Quick access di header + contact section
2. Klik icon → Buka WhatsApp/Instagram langsung
3. WhatsApp: `https://wa.me/628123456789`
4. Instagram: `https://instagram.com/username`

---

## ✅ TESTING RESULTS

### Backend API Testing

```bash
# Update Store
PUT http://localhost:8000/api/umkm/1
Headers: X-User-ID: 1
Body: {
  "nama_toko": "Toko Baru",
  "whatsapp": "628123456789",
  "instagram": "tokobaruig",
  "about_me": "Ini cerita toko saya"
}

Response 200:
{
  "success": true,
  "message": "Store updated successfully",
  "data": { ... }
}
```

### Database Verification

```bash
php check_tumkm_columns.php

Columns in tumkm table:
- id ✅
- user_id ✅
- nama_toko ✅
- nama_pemilik ✅
- deskripsi ✅
- foto_toko ✅
- kategori_id ✅
- whatsapp ✅
- telepon ✅
- email ✅
- instagram ✅
- about_me ✅ (BARU)
- alamat ✅
- kota ✅
- kode_pos ✅
- status ✅
- created_at ✅
- updated_at ✅
```

### Frontend Testing

- ✅ Modal edit toko buka dengan data current
- ✅ Image upload convert ke base64
- ✅ Form validation bekerja
- ✅ Save data ke backend berhasil
- ✅ Toast notifications tampil
- ✅ WhatsApp icon hijau, klik buka wa.me
- ✅ Instagram icon gradient, klik buka instagram.com
- ✅ Icons tampil di StandCard dan MenuModal
- ✅ Data refresh otomatis setelah edit

---

## 🎯 STATUS: COMPLETE

**Semua fitur berfungsi dengan sempurna!**

✅ Edit toko UMKM dengan image upload  
✅ Edit produk dengan image upload  
✅ WhatsApp icon dengan link wa.me  
✅ Instagram icon dengan link instagram.com  
✅ Backend API endpoints (PUT /umkm/{id} dan /umkm/product/{id})  
✅ Database migration untuk field `about_me`  
✅ Frontend-backend integration lengkap  
✅ Ownership validation & security  
✅ Toast notifications untuk feedback  
✅ Auto refresh setelah update

**Date Completed**: 21 Desember 2025  
**Tested By**: User  
**Result**: BERHASIL 100%
