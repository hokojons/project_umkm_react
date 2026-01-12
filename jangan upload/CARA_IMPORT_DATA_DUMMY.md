# 📦 Cara Import Data Dummy UMKM

## File yang Tersedia
- **dummy_data_products_events.sql** - File SQL berisi data dummy lengkap

## 📊 Isi Data Dummy

### Data yang Akan Ditambahkan:
✅ **5 Kategori** (Makanan, Fashion, Kerajinan, Elektronik, Furniture)  
✅ **8 Pengguna UMKM** (dengan password default: `password123`)  
✅ **8 UMKM Businesses**  
✅ **52 Produk** dengan harga dan deskripsi lengkap  
✅ **16 Events/Acara** dari Januari - Juli 2026

---

## 🚀 Cara Import via phpMyAdmin

### Langkah-langkah:

1. **Buka XAMPP Control Panel**
   - Start Apache dan MySQL

2. **Buka phpMyAdmin**
   - Browser: `http://localhost/phpmyadmin`

3. **Pilih Database**
   - Klik database `dbumkm` di sidebar kiri

4. **Import File SQL**
   - Klik tab **SQL** di bagian atas
   - Copy-paste isi file `dummy_data_products_events.sql`
   - **ATAU** klik tab **Import** → pilih file → klik **Go**

5. **Selesai!**
   - Jika berhasil, akan muncul pesan sukses
   - Cek tabel `tumkm`, `tproduk`, dan `tacara`

---

## 📋 Detail Data

### Daftar UMKM:
1. 🍜 **Warung Nasi Bu Siti** (Makanan)
2. 👔 **Kerajinan Batik Budi** (Fashion)
3. 🧁 **Toko Kue Rina** (Makanan)
4. 🔌 **Elektronik Ahmad** (Elektronik)
5. 👜 **Tas Rajut Dewi** (Kerajinan)
6. ☕ **Kopi Nusantara Joko** (Makanan)
7. 🧕 **Fashion Hijab Mega** (Fashion)
8. 🪑 **Furniture Kayu Hendra** (Furniture)

### Contoh Produk:
- Nasi Goreng Spesial - Rp 15.000
- Batik Tulis Motif Parang - Rp 350.000
- Kue Nastar Premium - Rp 85.000
- Power Bank 10000mAh - Rp 125.000
- Dan 48 produk lainnya!

### Contoh Event:
- Bazar UMKM Januari 2026
- Workshop Pemasaran Digital
- Festival Kuliner Nusantara
- Dan 13 event lainnya!

---

## ⚠️ Catatan Penting

- Data menggunakan struktur tabel yang sudah ada (`tumkm`, `tproduk`, `tacara`, dll)
- Password default semua user: `password123` (sudah di-hash)
- Semua kode menggunakan prefix untuk kemudahan tracking:
  - Kategori: `KT001`, `KT002`, dst
  - User: `USR001`, `USR002`, dst
  - Produk: `PRD001`, `PRD002`, dst
  - Acara: `ACR001`, `ACR002`, dst

---

## 🔍 Cara Melihat Hasil

Setelah import berhasil, cek di phpMyAdmin:

```sql
-- Lihat semua UMKM
SELECT * FROM tumkm;

-- Lihat semua produk
SELECT * FROM tproduk;

-- Lihat semua acara
SELECT * FROM tacara;

-- Lihat produk dari UMKM tertentu
SELECT * FROM tproduk WHERE kodepengguna = 'USR001';
```

---

**Selamat mencoba! 🎉**
