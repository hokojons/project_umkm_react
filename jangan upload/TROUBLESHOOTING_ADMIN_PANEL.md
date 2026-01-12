# Troubleshooting Admin Panel - White Screen Issue

## Masalah
Admin panel tidak bisa dibuka, muncul UI sebentar kemudian menjadi putih (white screen).

## Penyebab yang Sudah Diperbaiki

### 1. **Tipe Data User Role Tidak Match**
   - **Masalah**: AuthContext menggunakan `role: "admin" | "user" | "umkm"` tetapi database menggunakan `"admin" | "customer" | "umkm_owner"`
   - **Solusi**: Update tipe User di AuthContext.tsx untuk match dengan database
   ```typescript
   interface User {
     id: string;
     email: string;
     name: string;
     role: "admin" | "customer" | "umkm_owner";
     nama_lengkap?: string;
     no_telepon?: string;
     status?: string;
     wa_verified?: boolean;
   }
   ```

### 2. **Mapping Field User Salah**
   - **Masalah**: Backend mengirim `nama_lengkap` tetapi frontend mengharapkan `nama` atau `name`
   - **Solusi**: Update signIn function untuk mapping data.data.nama_lengkap
   ```typescript
   const newUser: User = {
     id: data.data.id || `user_${Date.now()}`,
     email: data.data.email || email,
     name: data.data.nama_lengkap || data.data.nama || data.data.name || email,
     role: data.data.role || "customer",
     nama_lengkap: data.data.nama_lengkap,
     no_telepon: data.data.no_telepon,
     status: data.data.status,
     wa_verified: data.data.wa_verified,
   };
   ```

### 3. **Tidak Ada Guard Clause**
   - **Masalah**: AdminPanel tidak cek apakah user adalah admin sebelum render
   - **Solusi**: Tambahkan guard clause di AdminPanel.tsx
   ```typescript
   // Guard: hanya tampilkan jika panel terbuka
   if (!isOpen) return null;

   // Guard: hanya admin yang bisa akses
   if (!user || user.role !== "admin") {
     return (
       <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
         <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md">
           <h3 className="text-xl font-bold text-red-600 mb-4">Akses Ditolak</h3>
           <p className="text-gray-700 dark:text-gray-300 mb-6">
             Anda tidak memiliki izin untuk mengakses Admin Panel.
           </p>
           <button onClick={onClose} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
             Tutup
           </button>
         </div>
       </div>
     );
   }
   ```

### 4. **Tidak Ada Error Handling dan Loading State**
   - **Masalah**: Jika fetch data gagal, tidak ada feedback ke user
   - **Solusi**: Tambahkan loading state dan error handling
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const fetchData = async () => {
     setIsLoading(true);
     setError(null);
     try {
       // fetch logic...
     } catch (error) {
       console.error("Error fetching data:", error);
       setError("Terjadi kesalahan saat memuat data");
       toast.error("Gagal memuat data");
     } finally {
       setIsLoading(false);
     }
   };
   ```

### 5. **Conditional Rendering di Content**
   - **Solusi**: Tambahkan loading dan error state di content area
   ```typescript
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
           <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
             Coba Lagi
           </button>
         </div>
       </div>
     ) : (
       // ... rest of content
     )}
   </div>
   ```

## Cara Testing

1. **Jalankan Backend Laravel**
   ```bash
   cd Laravel
   php artisan serve
   ```

2. **Jalankan Frontend React**
   ```bash
   cd React
   npm run dev
   ```

3. **Login sebagai Admin**
   - Email: admin@umkm.com
   - Password: password
   - Atau Phone: 08123456789

4. **Buka Admin Panel**
   - Klik avatar di navbar
   - Pilih "Admin Panel"
   - Panel seharusnya terbuka tanpa white screen

## Checklist Debug

Jika masih ada masalah white screen:

- [ ] Cek console browser (F12) untuk error JavaScript
- [ ] Verifikasi user sudah login dengan benar (cek localStorage)
- [ ] Pastikan user.role === "admin"
- [ ] Cek network tab untuk error API calls
- [ ] Pastikan Laravel backend running di http://127.0.0.1:8000
- [ ] Cek apakah EventManagement dan GiftPackageManagement components ada
- [ ] Verifikasi tidak ada syntax error di AdminPanel.tsx

## Komponen Terkait

1. **AdminPanel.tsx** - Main admin panel component
2. **AuthContext.tsx** - Authentication context dengan User interface
3. **EventManagement.tsx** - Event management component
4. **GiftPackageManagement.tsx** - Gift package management component
5. **Navbar.tsx** - Navigation dengan admin panel trigger

## API Endpoints yang Digunakan

- `GET /api/umkm` - Fetch active UMKM
- `GET /api/umkm/pending` - Fetch pending UMKM stores
- `GET /api/role-requests/pending` - Fetch role upgrade requests
- `GET /api/admin/users` - Fetch all users
- `POST /api/auth/login` - Login

## Status Perbaikan

✅ User interface type updated
✅ Guard clauses added
✅ Loading state implemented
✅ Error handling added
✅ Field mapping fixed (nama_lengkap)
✅ Role types updated (admin/customer/umkm_owner)

Admin panel seharusnya sekarang bisa dibuka tanpa white screen!
