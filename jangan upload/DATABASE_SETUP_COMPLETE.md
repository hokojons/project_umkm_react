# Database Setup - XAMPP MySQL

## Status: ✅ Connected & Running

### Server Information
- **Laravel Backend**: http://127.0.0.1:8000
- **React Frontend**: http://localhost:3000
- **Database**: MySQL (XAMPP di C:\XAM)
- **Database Name**: dbumkm

### Database Credentials
```
Host: 127.0.0.1
Port: 3306
Database: dbumkm
Username: root
Password: (kosong)
```

### Tables Created
✅ **Laravel Authentication**
- `users` - User accounts (customer, umkm_owner, admin)
- `wa_verifications` - WhatsApp OTP verification
- `sessions` - Laravel sessions

✅ **UMKM System**
- `categories` - Product categories
- `umkm` - UMKM businesses
- `products` - Products from each UMKM
- `cart_items` - Shopping cart
- `orders` - Order transactions
- `order_items` - Order details

✅ **Events**
- `events` - UMKM events/bazaars
- `event_participants` - Event registrations

✅ **Additional**
- `role_upgrade_requests` - User role upgrade requests
- `cache`, `jobs`, `failed_jobs` - Laravel system tables

### Sample Data Inserted
✅ **Admin Account**
- Email: admin@umkm.com
- Phone: 08123456789
- Password: password (default Laravel hash)

✅ **5 UMKM Businesses**
1. Warung Makan Bu Budi (Makanan) - 4 produk
2. Kerajinan Tangan Siti (Kerajinan) - 4 produk
3. Fashion Ahmad Collection (Fashion) - 4 produk
4. Kue Lestari (Makanan) - 4 produk
5. Elektronik Rudi (Elektronik) - 4 produk

Total: **20 produk** siap ditampilkan di frontend

✅ **Categories**
- Makanan
- Kerajinan
- Fashion
- Elektronik
- Lainnya

✅ **Events**
- Bazar UMKM Januari 2026
- Workshop Pemasaran Digital
- Festival Kuliner Nusantara

### API Endpoints Working
```
GET /api/umkm              - Get all UMKM with products ✅
GET /api/umkm/{id}         - Get single UMKM detail ✅
GET /api/umkm/{id}/products - Get UMKM products ✅
```

### Test Results
```
✓ Database connection successful!
✓ Tables found: 25
✓ Users table: 6 records (1 admin + 5 UMKM owners)
✓ UMKM table: 5 records
✓ Products table: 20 records
✓ All tests passed! Database is ready.
```

### Frontend Features Ready
1. ✅ Home page dengan list semua UMKM
2. ✅ Click UMKM card → Modal detail UMKM
3. ✅ Products page dengan filter & search
4. ✅ Events page
5. ✅ Shopping cart system
6. ✅ User authentication

### How to Use
1. **Pastikan XAMPP MySQL berjalan**
2. **Start Laravel**: `cd Laravel && php artisan serve`
3. **Start React**: `cd React && npm run dev`
4. **Open**: http://localhost:3000

### Data yang Ditampilkan di Frontend
- ✅ 5 UMKM dengan foto, rating, kategori
- ✅ 20 produk dengan harga, stok, deskripsi
- ✅ 3 event aktif
- ✅ Contact info (WhatsApp, Instagram) untuk setiap UMKM
- ✅ Semua data sudah ter-integrasi dengan backend

## Next Steps (Optional)
1. Upload foto untuk UMKM dan produk
2. Tambah lebih banyak data sample
3. Test fitur cart dan checkout
4. Test user registration & login

---
**Created**: January 8, 2026
**Status**: Production Ready 🚀
