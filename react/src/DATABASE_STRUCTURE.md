# Database Structure - Pasar UMKM Marketplace

## Gambaran Umum
Aplikasi ini menggunakan **localStorage** sebagai database utama (100% frontend, tanpa backend). Semua data disimpan di browser pengguna dalam format JSON.

---

## 📦 LocalStorage Keys

### 1. `pasar_umkm_users`
**Deskripsi**: Menyimpan semua data pengguna yang terdaftar di sistem

**Format**: Array of User Objects

**Struktur Data**:
```typescript
interface User {
  id: string;           // Format: "user_[timestamp]_[random]"
  email: string;        // Email unik pengguna
  name: string;         // Nama lengkap pengguna
  role: 'admin' | 'user' | 'umkm';  // Role 3 tingkat
}
```

**Contoh Data**:
```json
[
  {
    "id": "user_1734569000_abc123",
    "email": "admin@pasarumkm.com",
    "name": "Admin Pasar UMKM",
    "role": "admin"
  },
  {
    "id": "user_1734569100_def456",
    "email": "budi@gmail.com",
    "name": "Budi Santoso",
    "role": "user"
  },
  {
    "id": "user_1734569200_ghi789",
    "email": "sari@gmail.com",
    "name": "Sari Wijaya",
    "role": "umkm"
  }
]
```

**Role Penjelasan**:
- `user`: Hanya bisa membeli produk dan request upgrade ke UMKM
- `umkm`: Bisa manage toko/produk sendiri DAN beli dari UMKM lain
- `admin`: Bisa approve/remove/mengubah role user dan remove UMKM listing

---

### 2. `pasar_umkm_passwords`
**Deskripsi**: Menyimpan password pengguna (dalam plain text - untuk demo saja)

**Format**: Object dengan email sebagai key

**Struktur Data**:
```typescript
Record<string, string>  // { email: password }
```

**Contoh Data**:
```json
{
  "admin@pasarumkm.com": "admin123",
  "budi@gmail.com": "budi123",
  "sari@gmail.com": "sari123"
}
```

⚠️ **Security Note**: Dalam production, password harus di-hash. Ini plain text untuk keperluan demo saja.

---

### 3. `pasar_umkm_current_user`
**Deskripsi**: Menyimpan data user yang sedang login

**Format**: Single User Object (JSON)

**Struktur Data**:
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'umkm';
}
```

**Contoh Data**:
```json
{
  "id": "user_1734569100_def456",
  "email": "budi@gmail.com",
  "name": "Budi Santoso",
  "role": "user"
}
```

---

### 4. `pasar_umkm_access_token`
**Deskripsi**: Menyimpan access token untuk sesi login

**Format**: String

**Struktur Data**:
```typescript
string  // Format: "token_[timestamp]_[random]"
```

**Contoh Data**:
```json
"token_1734569500_xyz789abc"
```

---

### 5. `pasar_umkm_businesses`
**Deskripsi**: Menyimpan semua data bisnis UMKM yang diajukan oleh user dengan role UMKM

**Format**: Array of UMKMBusiness Objects

**Struktur Data**:
```typescript
interface UMKMBusiness {
  id: string;              // ID unik bisnis
  name: string;            // Nama bisnis/toko
  owner: string;           // Nama pemilik
  description: string;     // Deskripsi singkat bisnis
  about?: string;          // About Me section (cerita pemilik)
  image: string;           // URL gambar utama bisnis
  products: Product[];     // Array produk dalam bisnis
  rating: number;          // Rating (0-5)
  category: string;        // Kategori: Fashion, Kerajinan, Kuliner, Kecantikan, Aksesoris, UMKM
  ownerId?: string;        // ID user pemilik (untuk management)
  status?: 'pending' | 'approved' | 'rejected';  // Status approval
  submittedAt?: string;    // Timestamp pengajuan
}
```

**Product Structure**:
```typescript
interface Product {
  id: string;              // Format: "[businessId]-[number]"
  name: string;            // Nama produk
  description: string;     // Deskripsi produk
  price: number;           // Harga dalam Rupiah (integer)
  image?: string;          // URL gambar produk
  category: 'product' | 'food' | 'accessory' | 'craft';
  businessId?: string;     // ID bisnis pemilik
  ownerId?: string;        // ID user pemilik
}
```

**Contoh Data**:
```json
[
  {
    "id": "1",
    "name": "Batik Nusantara Ibu Sari",
    "owner": "Ibu Sari",
    "description": "Batik tulis dan cap berkualitas dengan motif tradisional dan modern",
    "about": "Saya Ibu Sari, pengrajin batik sejak 1995...",
    "image": "https://images.unsplash.com/...",
    "rating": 4.9,
    "category": "Fashion",
    "ownerId": "user_123_abc",
    "status": "approved",
    "products": [
      {
        "id": "1-1",
        "name": "Kemeja Batik Pria",
        "description": "Batik cap motif parang, bahan katun premium",
        "price": 175000,
        "category": "product",
        "image": "https://images.unsplash.com/...",
        "businessId": "1",
        "ownerId": "user_123_abc"
      },
      {
        "id": "1-2",
        "name": "Dress Batik Wanita",
        "description": "Batik tulis motif kawung, model modern",
        "price": 250000,
        "category": "product",
        "image": "https://images.unsplash.com/..."
      }
    ]
  }
]
```

---

### 6. `pasar_umkm_cart`
**Deskripsi**: Menyimpan item dalam shopping cart user yang sedang login

**Format**: Array of CartItem Objects

**Struktur Data**:
```typescript
interface CartItem {
  id: string;              // Product ID
  name: string;            // Nama produk
  description: string;     // Deskripsi produk
  price: number;           // Harga satuan
  image?: string;          // URL gambar
  category: 'product' | 'food' | 'accessory' | 'craft';
  quantity: number;        // Jumlah item
  businessName: string;    // Nama bisnis penjual
  businessId: string;      // ID bisnis penjual
}
```

**Contoh Data**:
```json
[
  {
    "id": "1-1",
    "name": "Kemeja Batik Pria",
    "description": "Batik cap motif parang, bahan katun premium",
    "price": 175000,
    "category": "product",
    "image": "https://images.unsplash.com/...",
    "quantity": 2,
    "businessName": "Batik Nusantara Ibu Sari",
    "businessId": "1"
  },
  {
    "id": "3-1",
    "name": "Kue Kering Nastar",
    "description": "Nastar selai nanas premium, toples 500gr",
    "price": 85000,
    "category": "food",
    "quantity": 1,
    "businessName": "Camilan Khas Bu Ani",
    "businessId": "3"
  }
]
```

---

### 7. `pasar_umkm_orders`
**Deskripsi**: Menyimpan riwayat pesanan yang telah di-checkout

**Format**: Array of Order Objects

**Struktur Data**:
```typescript
interface Order {
  id: string;              // Order ID unik
  userId: string;          // ID pembeli
  userName: string;        // Nama pembeli
  userEmail: string;       // Email pembeli
  items: CartItem[];       // Daftar item yang dibeli
  totalAmount: number;     // Total harga
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: 'bank_transfer' | 'e_wallet' | 'cod';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

**Contoh Data**:
```json
[
  {
    "id": "order_1734570000_abc123",
    "userId": "user_1734569100_def456",
    "userName": "Budi Santoso",
    "userEmail": "budi@gmail.com",
    "items": [
      {
        "id": "1-1",
        "name": "Kemeja Batik Pria",
        "price": 175000,
        "quantity": 2,
        "businessName": "Batik Nusantara Ibu Sari",
        "businessId": "1"
      }
    ],
    "totalAmount": 350000,
    "shippingAddress": {
      "name": "Budi Santoso",
      "phone": "081234567890",
      "address": "Jl. Merdeka No. 123",
      "city": "Jakarta",
      "postalCode": "12345"
    },
    "paymentMethod": "bank_transfer",
    "status": "pending",
    "createdAt": "2024-12-17T10:30:00.000Z",
    "updatedAt": "2024-12-17T10:30:00.000Z"
  }
]
```

---

### 8. `pasar_umkm_role_upgrade_requests`
**Deskripsi**: Menyimpan permintaan upgrade role dari User ke UMKM

**Format**: Array of RoleUpgradeRequest Objects

**Struktur Data**:
```typescript
interface RoleUpgradeRequest {
  id: string;              // Request ID unik
  userId: string;          // ID user yang request
  userEmail: string;       // Email user
  userName: string;        // Nama user
  requestedRole: 'umkm';   // Selalu 'umkm' (user hanya bisa upgrade ke UMKM)
  currentRole: string;     // Role saat ini
  reason?: string;         // Alasan request (optional)
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;     // ISO timestamp pengajuan
  reviewedAt?: string;     // ISO timestamp review oleh admin
  reviewedBy?: string;     // ID admin yang review
}
```

**Contoh Data**:
```json
[
  {
    "id": "request_1734570100_xyz123",
    "userId": "user_1734569100_def456",
    "userEmail": "budi@gmail.com",
    "userName": "Budi Santoso",
    "requestedRole": "umkm",
    "currentRole": "user",
    "reason": "Saya ingin membuka toko batik online",
    "status": "pending",
    "submittedAt": "2024-12-17T11:00:00.000Z"
  },
  {
    "id": "request_1734570200_abc789",
    "userId": "user_1734569300_jkl012",
    "userEmail": "ani@gmail.com",
    "userName": "Ani Lestari",
    "requestedRole": "umkm",
    "currentRole": "user",
    "reason": "Saya sudah punya usaha kue kering",
    "status": "approved",
    "submittedAt": "2024-12-16T09:00:00.000Z",
    "reviewedAt": "2024-12-16T14:30:00.000Z",
    "reviewedBy": "user_1734569000_abc123"
  }
]
```

---

## 🗂️ Kategori Bisnis

Aplikasi mendukung 6 kategori bisnis:

1. **Fashion** - Pakaian, tekstil, batik
2. **Kerajinan** - Anyaman, rotan, kerajinan tangan
3. **Kuliner** - Makanan, minuman, camilan
4. **Kecantikan** - Skincare, kosmetik, perawatan
5. **Aksesoris** - Tas, perhiasan, aksesoris fashion
6. **UMKM** - Multi-produk campuran (berbagai kategori produk dalam satu bisnis)

---

## 🗂️ Kategori Produk

Setiap produk memiliki kategori:

1. **product** - Produk umum (pakaian, alat, dll)
2. **food** - Makanan dan minuman
3. **accessory** - Aksesoris dan pelengkap
4. **craft** - Kerajinan tangan

---

## 📊 Dummy Data Default

Aplikasi dilengkapi dengan 10 bisnis UMKM dummy sebagai seed data (di file `/data/stands.ts`):

| ID | Nama Bisnis | Owner | Kategori | Produk |
|----|-------------|-------|----------|---------|
| 1 | Batik Nusantara Ibu Sari | Ibu Sari | Fashion | 5 produk batik |
| 2 | Kerajinan Anyaman Pak Joko | Pak Joko | Kerajinan | 5 produk anyaman |
| 3 | Camilan Khas Bu Ani | Bu Ani | Kuliner | 5 jenis camilan |
| 4 | Skincare Alami Mba Dina | Mba Dina | Kecantikan | 5 produk skincare |
| 5 | Tas Kanvas Kreatif Mas Rian | Mas Rian | Fashion | 5 jenis tas |
| 6 | Aksesoris Handmade Mba Putri | Mba Putri | Aksesoris | 5 perhiasan |
| 7 | UMKM Berkah Sejahtera | Bu Yanti | UMKM | 5 produk campuran |
| 8 | Kreasi Nusantara Pak Budi | Pak Budi | UMKM | 5 produk fashion & craft |
| 9 | Dapur Mama Sinta | Mama Sinta | UMKM | 5 frozen food |
| 10 | Eco Product Indonesia | Kak Dimas | UMKM | 5 produk eco-friendly |

**Total: 50 produk** (setiap bisnis punya 5 produk)

UMKM dengan ID 7-10 memiliki field `about` (About Me section) yang berisi cerita pemilik bisnis.

---

## 🔑 Test Accounts

Aplikasi menyediakan fitur quick login dengan 3 tombol test:

### Test Admin
```json
{
  "email": "admin@test.com",
  "password": "admin123",
  "name": "Admin Test",
  "role": "admin"
}
```

### Test User
```json
{
  "email": "user@test.com",
  "password": "user123",
  "name": "User Test",
  "role": "user"
}
```

### Test UMKM
```json
{
  "email": "umkm@test.com",
  "password": "umkm123",
  "name": "UMKM Test",
  "role": "umkm"
}
```

### Buat Test User Acak
Tombol ini akan generate user baru dengan kredensial random:
```json
{
  "email": "test_[random]@example.com",
  "password": "test123",
  "name": "Test User [random]",
  "role": "user"
}
```

---

## 🔄 Data Flow

### 1. Registration Flow
```
User Input (Email, Password, Name)
    ↓
Check if email exists in localStorage
    ↓
Create new User object with role='user'
    ↓
Save to pasar_umkm_users array
    ↓
Save password to pasar_umkm_passwords
    ↓
Auto sign in
```

### 2. Login Flow
```
User Input (Email, Password)
    ↓
Get pasar_umkm_users and pasar_umkm_passwords
    ↓
Validate email & password
    ↓
Generate access token
    ↓
Save user to pasar_umkm_current_user
    ↓
Save token to pasar_umkm_access_token
```

### 3. Add to Cart Flow
```
User clicks "Add to Cart"
    ↓
Get product data
    ↓
Get current cart from localStorage
    ↓
Check if product already in cart
    ↓
If exists: increase quantity
    ↓
If not: add new item with quantity=1
    ↓
Save updated cart to pasar_umkm_cart
    ↓
Show toast notification
```

### 4. Checkout Flow
```
User fills shipping info
    ↓
Create Order object from cart items
    ↓
Save to pasar_umkm_orders
    ↓
Clear pasar_umkm_cart
    ↓
Show success notification
```

### 5. Submit Business Flow (UMKM)
```
UMKM user creates business with products
    ↓
Create UMKMBusiness object with products array
    ↓
Set ownerId from current user
    ↓
Set status='approved' (auto-approve untuk demo)
    ↓
Save to pasar_umkm_businesses
    ↓
Display in marketplace
```

### 6. Role Upgrade Request Flow
```
User requests upgrade to UMKM
    ↓
Create RoleUpgradeRequest with status='pending'
    ↓
Save to pasar_umkm_role_upgrade_requests
    ↓
Admin reviews in Admin Panel
    ↓
If approved:
  - Update user role in pasar_umkm_users
  - Update request status to 'approved'
    ↓
User gets UMKM privileges
```

---

## 🛠️ Fungsi Helper (Utility)

### Get Current User
```javascript
const getCurrentUser = () => {
  const userStr = localStorage.getItem('pasar_umkm_current_user');
  return userStr ? JSON.parse(userStr) : null;
};
```

### Check If Logged In
```javascript
const isLoggedIn = () => {
  return localStorage.getItem('pasar_umkm_access_token') !== null;
};
```

### Get All Businesses
```javascript
const getAllBusinesses = () => {
  const businessesStr = localStorage.getItem('pasar_umkm_businesses');
  return businessesStr ? JSON.parse(businessesStr) : [];
};
```

### Get User's Businesses (for UMKM owners)
```javascript
const getUserBusinesses = (userId: string) => {
  const allBusinesses = getAllBusinesses();
  return allBusinesses.filter(b => b.ownerId === userId);
};
```

### Get Cart Items
```javascript
const getCartItems = () => {
  const cartStr = localStorage.getItem('pasar_umkm_cart');
  return cartStr ? JSON.parse(cartStr) : [];
};
```

### Get Cart Total
```javascript
const getCartTotal = () => {
  const items = getCartItems();
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};
```

---

## 📱 Storage Limits

⚠️ **Important**: localStorage memiliki batasan kapasitas

- **Maximum size**: 5-10 MB per domain (tergantung browser)
- **Recommendation**: Untuk production, gunakan database backend real (PostgreSQL, MySQL, MongoDB)
- **Current usage**: Dengan 50 produk dummy + beberapa user, sekitar 100-200 KB

---

## 🔒 Security Notes

1. **Password Storage**: Saat ini password disimpan dalam plain text di localStorage. Untuk production, HARUS menggunakan hash (bcrypt, argon2) dan backend server.

2. **XSS Protection**: Semua input user harus di-sanitize untuk mencegah XSS attacks.

3. **Data Validation**: Selalu validasi data sebelum menyimpan ke localStorage.

4. **Token Management**: Access token saat ini hanya random string. Untuk production, gunakan JWT dengan expiration.

5. **PII Data**: Jangan simpan data sensitif (KTP, nomor rekening, dll) di localStorage karena tidak encrypted.

---

## 🚀 Migration ke Backend (Future)

Jika ingin migrate ke backend real, structure ini sudah siap untuk:

1. **Supabase**: Tinggal buat table sesuai interface TypeScript
2. **PostgreSQL**: Schema langsung dari TypeScript interfaces
3. **MongoDB**: Collection structure dari interfaces
4. **Firebase**: Firestore collections matching the structure

**Rekomendasi**: Gunakan Supabase karena sudah terintegrasi dengan Figma Make dan memiliki authentication built-in.

---

## 📝 Changelog

- **v1.0** (Dec 2024): Initial database structure dengan localStorage
- Sistem 3-tier roles (User, UMKM, Admin)
- Shopping cart dengan quantity controls
- Checkout dengan shipping info
- Business submission untuk UMKM owners
- Role upgrade request system
- About Me section untuk UMKM
- Quick login test buttons

---

## 📞 Support

Jika ada pertanyaan tentang struktur database, silakan hubungi developer atau baca dokumentasi di file:
- `/types/index.ts` - TypeScript interfaces
- `/context/AuthContext.tsx` - Authentication logic
- `/context/CartContext.tsx` - Shopping cart logic
- `/data/stands.ts` - Dummy data

---

**Last Updated**: December 17, 2024
