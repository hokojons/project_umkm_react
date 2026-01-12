-- Sample data for UMKM system
USE dbumkm;

-- Sample UMKM owners
INSERT INTO `users` (`nama_lengkap`, `no_telepon`, `email`, `password`, `role`, `status`, `wa_verified`, `created_at`, `updated_at`) VALUES
('Budi Santoso', '081234567890', 'budi@umkm.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'umkm_owner', 'active', 1, NOW(), NOW()),
('Siti Rahmawati', '081234567891', 'siti@umkm.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'umkm_owner', 'active', 1, NOW(), NOW()),
('Ahmad Wijaya', '081234567892', 'ahmad@umkm.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'umkm_owner', 'active', 1, NOW(), NOW()),
('Dewi Lestari', '081234567893', 'dewi@umkm.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'umkm_owner', 'active', 1, NOW(), NOW()),
('Rudi Hartono', '081234567894', 'rudi@umkm.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'umkm_owner', 'active', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `nama_lengkap` = VALUES(`nama_lengkap`);

-- Sample UMKM businesses
INSERT INTO `umkm` (`user_id`, `nama_bisnis`, `deskripsi`, `kategori`, `alamat`, `whatsapp`, `instagram`, `status`, `rating`, `created_at`, `updated_at`) VALUES
(2, 'Warung Makan Bu Budi', 'Menyediakan berbagai makanan tradisional Indonesia dengan cita rasa autentik', 'Makanan', 'Jl. Sudirman No. 123, Jakarta', '081234567890', '@warungbubudi', 'active', 4.8, NOW(), NOW()),
(3, 'Kerajinan Tangan Siti', 'Produk kerajinan tangan berkualitas dari bahan alami pilihan', 'Kerajinan', 'Jl. Malioboro No. 45, Yogyakarta', '081234567891', '@kerajinansiti', 'active', 4.7, NOW(), NOW()),
(4, 'Fashion Ahmad Collection', 'Koleksi pakaian modern dengan sentuhan tradisional', 'Fashion', 'Jl. Braga No. 78, Bandung', '081234567892', '@ahmadcollection', 'active', 4.6, NOW(), NOW()),
(5, 'Kue Lestari', 'Aneka kue dan pastry segar setiap hari', 'Makanan', 'Jl. Thamrin No. 90, Jakarta', '081234567893', '@kuelestari', 'active', 4.9, NOW(), NOW()),
(6, 'Elektronik Rudi', 'Aksesori elektronik berkualitas dengan harga terjangkau', 'Elektronik', 'Jl. Gatot Subroto No. 56, Surabaya', '081234567894', '@elektronikridi', 'active', 4.5, NOW(), NOW())
ON DUPLICATE KEY UPDATE `nama_bisnis` = VALUES(`nama_bisnis`);

-- Sample products for each UMKM
-- Warung Makan Bu Budi (umkm_id = 1)
INSERT INTO `products` (`umkm_id`, `nama_produk`, `deskripsi`, `harga`, `stok`, `kategori`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Nasi Goreng Spesial', 'Nasi goreng dengan bumbu rahasia dan topping lengkap', 25000, 50, 'Makanan', 'active', NOW(), NOW()),
(1, 'Mie Ayam Bakso', 'Mie ayam dengan bakso sapi pilihan', 20000, 50, 'Makanan', 'active', NOW(), NOW()),
(1, 'Soto Ayam', 'Soto ayam dengan kuah bening dan rempah', 22000, 50, 'Makanan', 'active', NOW(), NOW()),
(1, 'Gado-Gado', 'Sayuran segar dengan bumbu kacang khas', 18000, 30, 'Makanan', 'active', NOW(), NOW()),

-- Kerajinan Tangan Siti (umkm_id = 2)
(2, 'Tas Rotan Anyaman', 'Tas rotan dengan anyaman halus dan kokoh', 150000, 20, 'Kerajinan', 'active', NOW(), NOW()),
(2, 'Dompet Kulit Asli', 'Dompet dari kulit asli dengan desain minimalis', 85000, 30, 'Kerajinan', 'active', NOW(), NOW()),
(2, 'Hiasan Dinding Batik', 'Hiasan dinding dengan motif batik tradisional', 120000, 15, 'Kerajinan', 'active', NOW(), NOW()),
(2, 'Gantungan Kunci Etnik', 'Gantungan kunci dengan ornamen etnik nusantara', 25000, 100, 'Kerajinan', 'active', NOW(), NOW()),

-- Fashion Ahmad Collection (umkm_id = 3)
(3, 'Batik Pria Modern', 'Kemeja batik dengan desain modern dan elegan', 250000, 25, 'Fashion', 'active', NOW(), NOW()),
(3, 'Dress Batik Wanita', 'Dress batik dengan potongan modern', 320000, 20, 'Fashion', 'active', NOW(), NOW()),
(3, 'Kemeja Tenun', 'Kemeja dari kain tenun berkualitas tinggi', 280000, 18, 'Fashion', 'active', NOW(), NOW()),
(3, 'Aksesoris Etnik', 'Berbagai aksesoris dengan sentuhan etnik', 75000, 50, 'Fashion', 'active', NOW(), NOW()),

-- Kue Lestari (umkm_id = 4)
(4, 'Brownies Coklat', 'Brownies coklat lembut dan legit', 45000, 40, 'Makanan', 'active', NOW(), NOW()),
(4, 'Kue Lapis Legit', 'Kue lapis dengan lapisan yang sempurna', 180000, 15, 'Makanan', 'active', NOW(), NOW()),
(4, 'Nastar Premium', 'Nastar dengan selai nanas asli', 65000, 30, 'Makanan', 'active', NOW(), NOW()),
(4, 'Cookies Almond', 'Cookies renyah dengan taburan almond', 55000, 35, 'Makanan', 'active', NOW(), NOW()),

-- Elektronik Rudi (umkm_id = 5)
(5, 'Earphone Bluetooth', 'Earphone wireless dengan kualitas suara jernih', 120000, 40, 'Elektronik', 'active', NOW(), NOW()),
(5, 'Power Bank 10000mAh', 'Power bank dengan kapasitas besar', 150000, 35, 'Elektronik', 'active', NOW(), NOW()),
(5, 'Kabel Charger Type-C', 'Kabel charger cepat tahan lama', 35000, 100, 'Elektronik', 'active', NOW(), NOW()),
(5, 'Phone Holder Mobil', 'Holder smartphone untuk di mobil', 45000, 60, 'Elektronik', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE `nama_produk` = VALUES(`nama_produk`);
