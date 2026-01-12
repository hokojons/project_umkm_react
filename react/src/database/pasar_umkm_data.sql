-- ============================================
-- SAMPLE DATA: PASAR UMKM MARKETPLACE
-- Data dummy untuk testing dan development
-- ============================================

USE `pasar_umkm`;

-- ============================================
-- INSERT USERS
-- Password: untuk demo semua password adalah 'test123'
-- Dalam production harus di-hash dengan bcrypt
-- ============================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `phone`) VALUES
('user_admin_001', 'admin@pasarumkm.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Pasar UMKM', 'admin', '081234567890'),
('user_test_001', 'user@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'User Test', 'user', '081234567891'),
('user_umkm_001', 'umkm@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'UMKM Test', 'umkm', '081234567892'),
('user_sari_001', 'sari@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ibu Sari', 'umkm', '081234567893'),
('user_joko_001', 'joko@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pak Joko', 'umkm', '081234567894'),
('user_ani_001', 'ani@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bu Ani', 'umkm', '081234567895'),
('user_dina_001', 'dina@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mba Dina', 'umkm', '081234567896'),
('user_rian_001', 'rian@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mas Rian', 'umkm', '081234567897'),
('user_putri_001', 'putri@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mba Putri', 'umkm', '081234567898'),
('user_yanti_001', 'yanti@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bu Yanti', 'umkm', '081234567899'),
('user_budi_001', 'budi.pk@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pak Budi', 'umkm', '081234567800'),
('user_sinta_001', 'sinta@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mama Sinta', 'umkm', '081234567801'),
('user_dimas_001', 'dimas@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kak Dimas', 'umkm', '081234567802');

-- ============================================
-- INSERT BUSINESSES
-- ============================================

INSERT INTO `businesses` (`id`, `owner_id`, `name`, `owner_name`, `description`, `about`, `image`, `rating`, `category`, `status`, `approved_at`) VALUES
('biz_001', 'user_sari_001', 'Batik Nusantara Ibu Sari', 'Ibu Sari', 'Batik tulis dan cap berkualitas dengan motif tradisional dan modern', NULL, 'https://images.unsplash.com/photo-1761516659497-8478e39d2b26?w=800', 4.9, 'Fashion', 'approved', NOW()),
('biz_002', 'user_joko_001', 'Kerajinan Anyaman Pak Joko', 'Pak Joko', 'Produk anyaman rotan dan bambu berkualitas tinggi, cocok untuk dekorasi rumah', NULL, 'https://images.unsplash.com/photo-1567696154083-9547fd0c8e1d?w=800', 4.8, 'Kerajinan', 'approved', NOW()),
('biz_003', 'user_ani_001', 'Camilan Khas Bu Ani', 'Bu Ani', 'Jajanan tradisional dan kue kering homemade tanpa pengawet', NULL, 'https://images.unsplash.com/photo-1761050163550-2a316fa3eceb?w=800', 4.9, 'Kuliner', 'approved', NOW()),
('biz_004', 'user_dina_001', 'Skincare Alami Mba Dina', 'Mba Dina', 'Produk perawatan kulit dari bahan alami tanpa bahan kimia berbahaya', NULL, 'https://images.unsplash.com/photo-1599847935464-fde3827639c2?w=800', 4.7, 'Kecantikan', 'approved', NOW()),
('biz_005', 'user_rian_001', 'Tas Kanvas Kreatif Mas Rian', 'Mas Rian', 'Tas kanvas custom dan totebag dengan desain unik dan personal', NULL, 'https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?w=800', 4.8, 'Fashion', 'approved', NOW()),
('biz_006', 'user_putri_001', 'Aksesoris Handmade Mba Putri', 'Mba Putri', 'Perhiasan dan aksesoris handmade dari bahan berkualitas dengan desain elegan', NULL, 'https://images.unsplash.com/photo-1573227890085-12ab5d68a170?w=800', 4.9, 'Aksesoris', 'approved', NOW()),
('biz_007', 'user_yanti_001', 'UMKM Berkah Sejahtera', 'Bu Yanti', 'UMKM lokal dengan berbagai produk handmade dan kuliner khas daerah', 'UMKM Berkah Sejahtera dimulai dari rumahan sejak 2018. Kami memproduksi berbagai produk handmade dan kuliner yang dikembangkan bersama ibu-ibu PKK di kampung kami. Visi kami adalah memberdayakan ekonomi keluarga melalui produk berkualitas dengan harga terjangkau.', 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800', 4.7, 'UMKM', 'approved', NOW()),
('biz_008', 'user_budi_001', 'Kreasi Nusantara Pak Budi', 'Pak Budi', 'UMKM yang fokus pada produk kerajinan dan fashion lokal berkualitas tinggi', 'Saya Pak Budi, pengrajin dan penjahit lokal yang sudah berkecimpung di dunia fashion sejak 1995. Kreasi Nusantara lahir dari kecintaan saya terhadap budaya Indonesia. Setiap produk dibuat dengan penuh cinta dan kehati-hatian untuk menghadirkan kualitas terbaik bagi pelanggan.', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800', 4.8, 'UMKM', 'approved', NOW()),
('biz_009', 'user_sinta_001', 'Dapur Mama Sinta', 'Mama Sinta', 'UMKM kuliner dengan berbagai olahan frozen food dan makanan siap saji berkualitas', 'Dapur Mama Sinta adalah bisnis rumahan yang saya mulai tahun 2020 di tengah pandemi. Dari dapur kecil, saya membuat berbagai frozen food dan makanan siap saji untuk membantu ibu-ibu yang sibuk. Semua produk dibuat fresh to order dengan bahan pilihan tanpa MSG berlebihan.', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800', 4.9, 'UMKM', 'approved', NOW()),
('biz_010', 'user_dimas_001', 'Eco Product Indonesia', 'Kak Dimas', 'UMKM ramah lingkungan dengan produk eco-friendly untuk gaya hidup sustainable', 'Eco Product Indonesia didirikan tahun 2019 dengan misi mengurangi penggunaan plastik sekali pakai. Kami menyediakan berbagai produk ramah lingkungan yang stylish dan fungsional. Setiap pembelian produk kami berarti Anda berkontribusi dalam menjaga bumi untuk generasi mendatang.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', 4.7, 'UMKM', 'approved', NOW());

-- ============================================
-- INSERT PRODUCTS
-- 50 produk total (5 produk per bisnis)
-- ============================================

-- Produk Batik Nusantara (biz_001)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_001_001', 'biz_001', 'user_sari_001', 'Kemeja Batik Pria', 'Batik cap motif parang, bahan katun premium', 175000, 'https://images.unsplash.com/photo-1761516659497-8478e39d2b26?w=400', 'product', 50),
('prod_001_002', 'biz_001', 'user_sari_001', 'Dress Batik Wanita', 'Batik tulis motif kawung, model modern', 250000, 'https://images.unsplash.com/photo-1761516659497-8478e39d2b26?w=400', 'product', 30),
('prod_001_003', 'biz_001', 'user_sari_001', 'Kain Batik 2 Meter', 'Kain batik cap siap jahit, berbagai motif', 150000, 'https://images.unsplash.com/photo-1761516659497-8478e39d2b26?w=400', 'product', 100),
('prod_001_004', 'biz_001', 'user_sari_001', 'Selendang Batik', 'Selendang batik sutra halus', 95000, 'https://images.unsplash.com/photo-1761516659497-8478e39d2b26?w=400', 'accessory', 75),
('prod_001_005', 'biz_001', 'user_sari_001', 'Masker Batik Kain', 'Masker kain batik, 3 lapis, isi 3 pcs', 35000, 'https://images.unsplash.com/photo-1761516659497-8478e39d2b26?w=400', 'accessory', 200);

-- Produk Kerajinan Anyaman (biz_002)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_002_001', 'biz_002', 'user_joko_001', 'Keranjang Rotan Besar', 'Keranjang rotan dengan pegangan, diameter 35cm', 125000, 'https://images.unsplash.com/photo-1567696154083-9547fd0c8e1d?w=400', 'craft', 40),
('prod_002_002', 'biz_002', 'user_joko_001', 'Tas Anyaman', 'Tas anyaman rotan untuk jalan-jalan, ukuran sedang', 95000, 'https://images.unsplash.com/photo-1567696154083-9547fd0c8e1d?w=400', 'accessory', 60),
('prod_002_003', 'biz_002', 'user_joko_001', 'Tempat Tisu Anyaman', 'Tempat tisu kotak dari anyaman bambu', 45000, 'https://images.unsplash.com/photo-1567696154083-9547fd0c8e1d?w=400', 'craft', 80),
('prod_002_004', 'biz_002', 'user_joko_001', 'Nampan Rotan', 'Nampan rotan bulat untuk sajian, diameter 30cm', 75000, 'https://images.unsplash.com/photo-1567696154083-9547fd0c8e1d?w=400', 'craft', 50),
('prod_002_005', 'biz_002', 'user_joko_001', 'Set Tatakan Gelas', 'Tatakan gelas anyaman rotan, isi 6 pcs', 35000, 'https://images.unsplash.com/photo-1567696154083-9547fd0c8e1d?w=400', 'craft', 120);

-- Produk Camilan Khas (biz_003)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_003_001', 'biz_003', 'user_ani_001', 'Kue Kering Nastar', 'Nastar selai nanas premium, toples 500gr', 85000, 'https://images.unsplash.com/photo-1761050163550-2a316fa3eceb?w=400', 'food', 100),
('prod_003_002', 'biz_003', 'user_ani_001', 'Kastengel Premium', 'Kastengel keju edam asli, toples 400gr', 95000, 'https://images.unsplash.com/photo-1761050163550-2a316fa3eceb?w=400', 'food', 80),
('prod_003_003', 'biz_003', 'user_ani_001', 'Keripik Tempe', 'Keripik tempe renyah aneka rasa, 250gr', 25000, 'https://images.unsplash.com/photo-1738225735048-d3c9f5ad0869?w=400', 'food', 150),
('prod_003_004', 'biz_003', 'user_ani_001', 'Dodol Betawi', 'Dodol durian asli Betawi, 300gr', 45000, 'https://images.unsplash.com/photo-1738225735048-d3c9f5ad0869?w=400', 'food', 90),
('prod_003_005', 'biz_003', 'user_ani_001', 'Paket Hampers', 'Paket kue kering 4 toples mix variant', 250000, 'https://images.unsplash.com/photo-1761050163550-2a316fa3eceb?w=400', 'food', 40);

-- Produk Skincare Alami (biz_004)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_004_001', 'biz_004', 'user_dina_001', 'Face Wash Natural', 'Sabun cuci muka dari green tea dan aloe vera', 45000, 'https://images.unsplash.com/photo-1599847935464-fde3827639c2?w=400', 'product', 120),
('prod_004_002', 'biz_004', 'user_dina_001', 'Toner Rice Water', 'Toner dari air beras fermentasi, 100ml', 35000, 'https://images.unsplash.com/photo-1599847935464-fde3827639c2?w=400', 'product', 100),
('prod_004_003', 'biz_004', 'user_dina_001', 'Serum Vitamin C', 'Serum brightening vitamin C murni, 30ml', 85000, 'https://images.unsplash.com/photo-1590156221187-1710315f710b?w=400', 'product', 80),
('prod_004_004', 'biz_004', 'user_dina_001', 'Masker Sheet Honey', 'Masker wajah madu asli, isi 5 sheet', 50000, 'https://images.unsplash.com/photo-1599847935464-fde3827639c2?w=400', 'product', 150),
('prod_004_005', 'biz_004', 'user_dina_001', 'Paket Glowing Skin', 'Paket lengkap skincare routine 4 produk', 175000, 'https://images.unsplash.com/photo-1590156221187-1710315f710b?w=400', 'product', 50);

-- Produk Tas Kanvas (biz_005)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_005_001', 'biz_005', 'user_rian_001', 'Tote Bag Polos', 'Tote bag kanvas natural ukuran L', 35000, 'https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?w=400', 'accessory', 200),
('prod_005_002', 'biz_005', 'user_rian_001', 'Tote Bag Custom Print', 'Tote bag dengan print design custom sesuai permintaan', 55000, 'https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?w=400', 'accessory', 150),
('prod_005_003', 'biz_005', 'user_rian_001', 'Tas Ransel Kanvas', 'Ransel kanvas dengan laptop slot', 125000, 'https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?w=400', 'accessory', 80),
('prod_005_004', 'biz_005', 'user_rian_001', 'Sling Bag Mini', 'Tas selempang kecil dari kanvas tebal', 65000, 'https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?w=400', 'accessory', 100),
('prod_005_005', 'biz_005', 'user_rian_001', 'Pouch Serba Guna', 'Pouch kanvas kecil untuk kosmetik/gadget', 25000, 'https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?w=400', 'accessory', 250);

-- Produk Aksesoris Handmade (biz_006)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_006_001', 'biz_006', 'user_putri_001', 'Anting Clay Minimalis', 'Anting clay handmade dengan desain modern', 35000, 'https://images.unsplash.com/photo-1573227890085-12ab5d68a170?w=400', 'accessory', 150),
('prod_006_002', 'biz_006', 'user_putri_001', 'Kalung Manik-manik', 'Kalung dari manik kaca dengan liontin unik', 55000, 'https://images.unsplash.com/photo-1573227890085-12ab5d68a170?w=400', 'accessory', 100),
('prod_006_003', 'biz_006', 'user_putri_001', 'Gelang Tasbih', 'Gelang tasbih kayu dengan ukiran halus', 45000, 'https://images.unsplash.com/photo-1573227890085-12ab5d68a170?w=400', 'accessory', 120),
('prod_006_004', 'biz_006', 'user_putri_001', 'Bros Hijab Premium', 'Bros hijab dengan kristal dan mutiara', 40000, 'https://images.unsplash.com/photo-1675929112281-7fad4e8b0687?w=400', 'accessory', 130),
('prod_006_005', 'biz_006', 'user_putri_001', 'Set Perhiasan Pesta', 'Set anting, kalung, dan gelang untuk acara spesial', 150000, 'https://images.unsplash.com/photo-1573227890085-12ab5d68a170?w=400', 'accessory', 60);

-- Produk UMKM Berkah Sejahtera (biz_007)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_007_001', 'biz_007', 'user_yanti_001', 'Sambal Ijo Homemade', 'Sambal ijo pedas segar, tanpa pengawet, 250ml', 25000, 'https://images.unsplash.com/photo-1639744091314-f6bbef87a5f5?w=400', 'food', 180),
('prod_007_002', 'biz_007', 'user_yanti_001', 'Tas Rajut Tangan', 'Tas rajut tangan dari benang premium, berbagai warna', 75000, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400', 'accessory', 70),
('prod_007_003', 'biz_007', 'user_yanti_001', 'Abon Sapi Asli', 'Abon sapi murni tanpa campuran, 250gr', 60000, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400', 'food', 90),
('prod_007_004', 'biz_007', 'user_yanti_001', 'Sandal Rajut Nyaman', 'Sandal rajut handmade untuk di rumah', 35000, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400', 'product', 120),
('prod_007_005', 'biz_007', 'user_yanti_001', 'Keripik Singkong Pedas', 'Keripik singkong renyah dengan bumbu pedas manis, 200gr', 20000, 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', 'food', 200);

-- Produk Kreasi Nusantara (biz_008)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_008_001', 'biz_008', 'user_budi_001', 'Sepatu Tenun Ikat', 'Sepatu casual dari tenun ikat asli NTT', 185000, 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400', 'product', 50),
('prod_008_002', 'biz_008', 'user_budi_001', 'Sarung Tenun Premium', 'Sarung tenun tangan motif khas, 100% katun', 225000, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400', 'product', 40),
('prod_008_003', 'biz_008', 'user_budi_001', 'Dompet Kulit Asli', 'Dompet kulit sapi asli handmade dengan jahitan rapi', 95000, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 'accessory', 80),
('prod_008_004', 'biz_008', 'user_budi_001', 'Ikat Pinggang Kulit', 'Ikat pinggang kulit asli dengan buckle vintage', 125000, 'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=400', 'accessory', 60),
('prod_008_005', 'biz_008', 'user_budi_001', 'Topi Rajut Wool', 'Topi rajut dari wool hangat untuk musim hujan', 55000, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400', 'accessory', 100);

-- Produk Dapur Mama Sinta (biz_009)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_009_001', 'biz_009', 'user_sinta_001', 'Dimsum Ayam Isi 10', 'Dimsum ayam homemade fresh frozen, isi 10pcs', 35000, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400', 'food', 150),
('prod_009_002', 'biz_009', 'user_sinta_001', 'Nugget Sayur Sehat', 'Nugget sayuran untuk anak, tanpa MSG, 250gr', 28000, 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400', 'food', 180),
('prod_009_003', 'biz_009', 'user_sinta_001', 'Risoles Mayo Isi 6', 'Risoles ragout ayam dengan mayonaise, isi 6pcs', 30000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 'food', 160),
('prod_009_004', 'biz_009', 'user_sinta_001', 'Samosa Kentang Isi 8', 'Samosa kentang bumbu kari, isi 8pcs', 25000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 'food', 170),
('prod_009_005', 'biz_009', 'user_sinta_001', 'Paket Frozen Food Mix', 'Paket hemat isi dimsum, nugget, risoles, dan samosa', 100000, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400', 'food', 80);

-- Produk Eco Product Indonesia (biz_010)
INSERT INTO `products` (`id`, `business_id`, `owner_id`, `name`, `description`, `price`, `image`, `category`, `stock`) VALUES
('prod_010_001', 'biz_010', 'user_dimas_001', 'Tumbler Bambu 500ml', 'Tumbler dari bambu natural dengan insulasi ganda', 85000, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 'product', 100),
('prod_010_002', 'biz_010', 'user_dimas_001', 'Sedotan Stainless Isi 4', 'Sedotan stainless reusable dengan sikat pembersih', 25000, 'https://images.unsplash.com/photo-1600857545015-bafc0fed2a6d?w=400', 'product', 200),
('prod_010_003', 'biz_010', 'user_dimas_001', 'Tas Belanja Kanvas Jumbo', 'Tas belanja kanvas tebal anti air, ukuran jumbo', 45000, 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400', 'accessory', 150),
('prod_010_004', 'biz_010', 'user_dimas_001', 'Lunch Box Stainless 3 Sekat', 'Kotak makan stainless 3 sekat kedap udara', 75000, 'https://images.unsplash.com/photo-1600857544200-e3b0e1b6c1da?w=400', 'product', 90),
('prod_010_005', 'biz_010', 'user_dimas_001', 'Sabun Cuci Piring Organik', 'Sabun cuci piring dari bahan organik, 500ml', 35000, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400', 'product', 180);

-- ============================================
-- INSERT SAMPLE ROLE UPGRADE REQUESTS
-- ============================================

INSERT INTO `role_upgrade_requests` (`id`, `user_id`, `user_email`, `user_name`, `requested_role`, `current_role`, `reason`, `status`, `submitted_at`) VALUES
('req_001', 'user_test_001', 'user@test.com', 'User Test', 'umkm', 'user', 'Saya ingin membuka toko kerajinan tangan di Pasar UMKM', 'pending', NOW());

-- ============================================
-- INSERT SAMPLE CART ITEMS
-- ============================================

INSERT INTO `cart_items` (`user_id`, `product_id`, `business_id`, `quantity`) VALUES
('user_test_001', 'prod_001_001', 'biz_001', 2),
('user_test_001', 'prod_003_001', 'biz_003', 1);

-- ============================================
-- INSERT SAMPLE ORDER
-- ============================================

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `shipping_name`, `shipping_phone`, `shipping_address`, `shipping_city`, `shipping_postal_code`, `payment_method`, `payment_status`, `order_status`) VALUES
('order_001', 'user_umkm_001', 435000, 'UMKM Test', '081234567892', 'Jl. Raya Pasar No. 123', 'Jakarta', '12345', 'bank_transfer', 'paid', 'delivered');

INSERT INTO `order_items` (`order_id`, `product_id`, `business_id`, `product_name`, `product_price`, `business_name`, `quantity`, `subtotal`) VALUES
('order_001', 'prod_001_001', 'biz_001', 'Kemeja Batik Pria', 175000, 'Batik Nusantara Ibu Sari', 2, 350000),
('order_001', 'prod_003_001', 'biz_003', 'Kue Kering Nastar', 85000, 'Camilan Khas Bu Ani', 1, 85000);

-- ============================================
-- INSERT SAMPLE REVIEWS
-- ============================================

INSERT INTO `reviews` (`user_id`, `business_id`, `product_id`, `rating`, `comment`) VALUES
('user_umkm_001', 'biz_001', 'prod_001_001', 5, 'Batiknya bagus banget! Bahannya adem dan motifnya keren.'),
('user_umkm_001', 'biz_003', 'prod_003_001', 5, 'Nastarnya enak, selainya pas manisnya!'),
('user_test_001', 'biz_004', 'prod_004_003', 4, 'Serum bagus, tapi harganya agak mahal');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Cek total users per role
SELECT role, COUNT(*) as total FROM users GROUP BY role;

-- Cek total businesses per kategori
SELECT category, COUNT(*) as total FROM businesses GROUP BY category;

-- Cek total products per business
SELECT b.name, COUNT(p.id) as total_products 
FROM businesses b 
LEFT JOIN products p ON b.id = p.business_id 
GROUP BY b.id, b.name;

-- Cek dashboard stats
SELECT * FROM v_dashboard_stats;
