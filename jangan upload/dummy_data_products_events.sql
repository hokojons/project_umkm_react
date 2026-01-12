-- ============================================================
-- DATA DUMMY UNTUK PRODUK UMKM DAN ACARA
-- Database: dbumkm
-- Disesuaikan dengan struktur tabel yang ada
-- Dibuat: 2026-01-11
-- ============================================================

USE dbumkm;

-- ============================================================
-- 1. DATA KATEGORI
-- ============================================================
INSERT INTO `tkategori` (`kodekategori`, `namakategori`, `status`) VALUES
('KT001', 'Makanan & Minuman', 'AKTIF'),
('KT002', 'Fashion & Pakaian', 'AKTIF'),
('KT003', 'Kerajinan Tangan', 'AKTIF'),
('KT004', 'Elektronik', 'AKTIF'),
('KT005', 'Furniture', 'AKTIF')
ON DUPLICATE KEY UPDATE `namakategori` = VALUES(`namakategori`);

-- ============================================================
-- 2. DATA PENGGUNA (UMKM Owners)
-- ============================================================
-- Password default untuk semua: "password123" (sudah di-hash)
INSERT INTO `tpengguna` (`kodepengguna`, `namapengguna`, `teleponpengguna`, `katakunci`, `status`) VALUES
('USR001', 'siti_nurhaliza', '081234567890', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AKTIF'),
('USR002', 'budi_santoso', '081234567891', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AKTIF'),
('USR003', 'rina_wijaya', '081234567892', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AKTIF'),
('USR004', 'ahmad_fauzi', '081234567893', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AKTIF'),
('USR005', 'dewi_lestari', '081234567894', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AKTIF'),
('USR006', 'joko_widodo', '081234567895', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AKTIF'),
('USR007', 'mega_sari', '081234567896', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AKTIF'),
('USR008', 'hendra_gunawan', '081234567897', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AKTIF')
ON DUPLICATE KEY UPDATE `namapengguna` = VALUES(`namapengguna`);

-- ============================================================
-- 3. DATA UMKM
-- ============================================================
INSERT INTO `tumkm` (`kodepengguna`, `namapemilik`, `namatoko`, `alamattoko`, `statuspengajuan`, `kodekategori`) VALUES
('USR001', 'Siti Nurhaliza', 'Warung Nasi Bu Siti', 'Jl. Merdeka No. 45, Bandung', 'DITERIMA', 'KT001'),
('USR002', 'Budi Santoso', 'Kerajinan Batik Budi', 'Jl. Pahlawan No. 12, Solo', 'DITERIMA', 'KT002'),
('USR003', 'Rina Wijaya', 'Toko Kue Rina', 'Jl. Raya Cipinang No. 78, Jakarta', 'DITERIMA', 'KT001'),
('USR004', 'Ahmad Fauzi', 'Elektronik Ahmad', 'Jl. Sudirman No. 34, Surabaya', 'DITERIMA', 'KT004'),
('USR005', 'Dewi Lestari', 'Tas Rajut Dewi', 'Jl. Gatot Subroto No. 56, Yogyakarta', 'DITERIMA', 'KT003'),
('USR006', 'Joko Widodo', 'Kopi Nusantara Joko', 'Jl. Diponegoro No. 89, Malang', 'DITERIMA', 'KT001'),
('USR007', 'Mega Sari', 'Fashion Hijab Mega', 'Jl. Ahmad Yani No. 23, Bekasi', 'DITERIMA', 'KT002'),
('USR008', 'Hendra Gunawan', 'Furniture Kayu Hendra', 'Jl. Veteran No. 67, Semarang', 'DITERIMA', 'KT005')
ON DUPLICATE KEY UPDATE `namatoko` = VALUES(`namatoko`);

-- ============================================================
-- 4. DATA PRODUK (50+ produk)
-- ============================================================

-- Produk dari Warung Nasi Bu Siti (USR001)
INSERT INTO `tproduk` (`kodepengguna`, `kodeproduk`, `namaproduk`, `harga`, `detail`, `status`) VALUES
('USR001', 'PRD001', 'Nasi Goreng Spesial', 15000, 'Nasi goreng dengan telur, ayam, dan sayuran segar. Bumbu rahasia yang menggugah selera.', 'AKTIF'),
('USR001', 'PRD002', 'Ayam Geprek Sambal Matah', 18000, 'Ayam goreng crispy dilengkapi sambal matah khas Bali yang pedas dan segar.', 'AKTIF'),
('USR001', 'PRD003', 'Soto Ayam Kuning', 12000, 'Soto ayam kuning dengan kuah gurih, dilengkapi telur, kentang, dan kerupuk.', 'AKTIF'),
('USR001', 'PRD004', 'Rendang Daging Sapi', 25000, 'Rendang daging sapi dengan bumbu tradisional, empuk dan kaya rempah.', 'AKTIF'),
('USR001', 'PRD005', 'Gado-gado Jakarta', 10000, 'Gado-gado dengan sayuran segar, tahu, tempe, dan bumbu kacang kental.', 'AKTIF'),
('USR001', 'PRD006', 'Es Teh Manis', 3000, 'Es teh manis segar untuk menemani makan siang Anda.', 'AKTIF'),

-- Produk dari Kerajinan Batik Budi (USR002)
('USR002', 'PRD007', 'Batik Tulis Motif Parang', 350000, 'Batik tulis halus dengan motif parang klasik. Bahan katun premium.', 'AKTIF'),
('USR002', 'PRD008', 'Batik Cap Motif Megamendung', 180000, 'Batik cap dengan motif megamendung khas Cirebon. Nyaman dipakai.', 'AKTIF'),
('USR002', 'PRD009', 'Kemeja Batik Pria Slim Fit', 250000, 'Kemeja batik pria dengan model slim fit modern. Cocok untuk acara formal.', 'AKTIF'),
('USR002', 'PRD010', 'Dress Batik Wanita', 280000, 'Dress batik wanita dengan cutting modern. Elegan dan nyaman.', 'AKTIF'),
('USR002', 'PRD011', 'Selendang Batik Sutra', 150000, 'Selendang batik dari bahan sutra halus. Cocok untuk acara resmi.', 'AKTIF'),
('USR002', 'PRD012', 'Sarung Batik Pria', 120000, 'Sarung batik dengan motif tradisional. Bahan adem dan nyaman.', 'AKTIF'),

-- Produk dari Toko Kue Rina (USR003)
('USR003', 'PRD013', 'Kue Nastar Premium', 85000, 'Kue nastar dengan selai nanas asli. Lembut dan lezat. 1 toples isi 50 pcs.', 'AKTIF'),
('USR003', 'PRD014', 'Kue Putri Salju', 75000, 'Kue putri salju yang lembut dengan taburan gula halus. 1 toples isi 40 pcs.', 'AKTIF'),
('USR003', 'PRD015', 'Brownies Coklat', 95000, 'Brownies coklat lembut dengan topping keju. Ukuran 20x20 cm.', 'AKTIF'),
('USR003', 'PRD016', 'Cake Ulang Tahun Custom', 250000, 'Cake ulang tahun dengan design custom sesuai permintaan. Ukuran 20 cm.', 'AKTIF'),
('USR003', 'PRD017', 'Cookies Chocochip', 65000, 'Cookies chocochip renyah dengan coklat chip premium. 1 toples isi 30 pcs.', 'AKTIF'),
('USR003', 'PRD018', 'Kue Sus Mini', 55000, 'Kue sus mini dengan varian rasa vanilla dan coklat. 1 box isi 20 pcs.', 'AKTIF'),

-- Produk dari Elektronik Ahmad (USR004)
('USR004', 'PRD019', 'Power Bank 10000mAh', 125000, 'Power bank kapasitas 10000mAh dengan dual USB port. Fast charging.', 'AKTIF'),
('USR004', 'PRD020', 'Kabel Charger Type-C 2 Meter', 45000, 'Kabel charger type-C panjang 2 meter. Tahan lama dan fast charging.', 'AKTIF'),
('USR004', 'PRD021', 'Earphone Gaming RGB', 180000, 'Earphone gaming dengan lampu RGB dan mic. Suara bass jernih.', 'AKTIF'),
('USR004', 'PRD022', 'Speaker Bluetooth Mini', 95000, 'Speaker bluetooth portable dengan suara jernih dan bass mantap.', 'AKTIF'),
('USR004', 'PRD023', 'USB Hub 4 Port', 75000, 'USB hub dengan 4 port USB 3.0. Cocok untuk laptop dan PC.', 'AKTIF'),
('USR004', 'PRD024', 'Lampu LED USB', 25000, 'Lampu LED USB portable untuk keyboard atau baca buku. Hemat energi.', 'AKTIF'),

-- Produk dari Tas Rajut Dewi (USR005)
('USR005', 'PRD025', 'Tas Rajut Tote Bag', 120000, 'Tas rajut tote bag dengan motif simple dan elegant. Cocok untuk sehari-hari.', 'AKTIF'),
('USR005', 'PRD026', 'Tas Rajut Sling Bag', 95000, 'Tas rajut model sling bag dengan tali panjang. Tersedia berbagai warna.', 'AKTIF'),
('USR005', 'PRD027', 'Dompet Rajut Mini', 45000, 'Dompet rajut mini untuk menyimpan uang dan kartu. Lucu dan praktis.', 'AKTIF'),
('USR005', 'PRD028', 'Tas Laptop Rajut 14 inch', 165000, 'Tas laptop rajut dengan padding empuk. Aman untuk laptop 14 inch.', 'AKTIF'),
('USR005', 'PRD029', 'Tas Belanja Rajut Jumbo', 75000, 'Tas belanja rajut ukuran jumbo. Kuat dan ramah lingkungan.', 'AKTIF'),
('USR005', 'PRD030', 'Pouch Rajut Organizer', 35000, 'Pouch rajut untuk organizer makeup atau alat tulis. Tersedia 3 ukuran.', 'AKTIF'),

-- Produk dari Kopi Nusantara Joko (USR006)
('USR006', 'PRD031', 'Kopi Arabica Gayo 250gr', 65000, 'Kopi arabica dari dataran tinggi Gayo, Aceh. Aroma harum dan rasa smooth.', 'AKTIF'),
('USR006', 'PRD032', 'Kopi Robusta Toraja 250gr', 55000, 'Kopi robusta dari Toraja, Sulawesi. Rasa kuat dengan kadar kafein tinggi.', 'AKTIF'),
('USR006', 'PRD033', 'Kopi Luwak Authentic 100gr', 250000, 'Kopi luwak asli dengan proses alami. Rasa premium dan eksklusif.', 'AKTIF'),
('USR006', 'PRD034', 'Kopi Mix Instant 20 Sachet', 35000, 'Kopi mix instant dengan gula dan creamer. Praktis untuk dibawa kemana-mana.', 'AKTIF'),
('USR006', 'PRD035', 'Kopi Susu Gula Aren 10 Sachet', 42000, 'Kopi susu dengan gula aren asli. Manis alami dan nikmat.', 'AKTIF'),
('USR006', 'PRD036', 'Paket Kopi Sampler 5 Varian', 180000, 'Paket kopi sampler dengan 5 varian kopi nusantara. Cocok untuk kado.', 'AKTIF'),

-- Produk dari Fashion Hijab Mega (USR007)
('USR007', 'PRD037', 'Hijab Segi Empat Voal', 45000, 'Hijab segi empat dari bahan voal premium. Adem dan tidak menerawang.', 'AKTIF'),
('USR007', 'PRD038', 'Hijab Pashmina Ceruti', 55000, 'Hijab pashmina dari bahan ceruti. Jatuh dan mudah dibentuk.', 'AKTIF'),
('USR007', 'PRD039', 'Gamis Syari Set Khimar', 280000, 'Gamis syari lengkap dengan khimar. Bahan wolfis adem dan nyaman.', 'AKTIF'),
('USR007', 'PRD040', 'Tunik Muslim Casual', 95000, 'Tunik muslim untuk acara casual. Bahan kaos combad halus.', 'AKTIF'),
('USR007', 'PRD041', 'Inner Hijab Ciput Anti Pusing', 25000, 'Inner hijab ciput dengan bahan anti pusing dan anti slip.', 'AKTIF'),
('USR007', 'PRD042', 'Bros Hijab Magnet Set 5 Pcs', 35000, 'Bros hijab model magnet isi 5 pcs dengan berbagai design.', 'AKTIF'),

-- Produk dari Furniture Kayu Hendra (USR008)
('USR008', 'PRD043', 'Meja Makan Kayu Jati 6 Kursi', 4500000, 'Meja makan kayu jati solid dengan 6 kursi. Design minimalis modern.', 'AKTIF'),
('USR008', 'PRD044', 'Lemari Pakaian 3 Pintu', 3200000, 'Lemari pakaian kayu jati 3 pintu dengan cermin. Finishing natural.', 'AKTIF'),
('USR008', 'PRD045', 'Rak Buku Minimalis', 850000, 'Rak buku kayu jati model minimalis dengan 5 tingkat.', 'AKTIF'),
('USR008', 'PRD046', 'Tempat Tidur King Size', 5500000, 'Tempat tidur king size dengan headboard ukir klasik.', 'AKTIF'),
('USR008', 'PRD047', 'Coffee Table Modern', 1200000, 'Coffee table kayu jati dengan design modern industrial.', 'AKTIF'),
('USR008', 'PRD048', 'Kursi Teras Set 2 Kursi + Meja', 2800000, 'Kursi teras kayu jati set lengkap dengan meja kecil.', 'AKTIF'),

-- Produk tambahan untuk variasi
('USR001', 'PRD049', 'Paket Nasi Box Hemat', 20000, 'Paket nasi box lengkap dengan lauk, sayur, dan minuman. Cocok untuk acara.', 'AKTIF'),
('USR003', 'PRD050', 'Roti Sobek Coklat Keju', 45000, 'Roti sobek lembut dengan isian coklat dan keju. Enak untuk sarapan.', 'AKTIF'),
('USR005', 'PRD051', 'Gantungan Kunci Rajut Lucu', 15000, 'Gantungan kunci rajut dengan berbagai karakter lucu. Cocok untuk souvenir.', 'AKTIF'),
('USR006', 'PRD052', 'Drip Coffee Single Origin Aceh', 12000, 'Drip coffee single origin dari Aceh. Praktis, tinggal seduh dengan air panas.', 'AKTIF')
ON DUPLICATE KEY UPDATE `namaproduk` = VALUES(`namaproduk`);

-- ============================================================
-- 5. DATA ACARA / EVENTS (15+ events)
-- ============================================================
INSERT INTO `tacara` (`kodeacara`, `namaacara`, `detail`, `tanggal`, `kuotapeserta`, `tanggaldaftar`) VALUES
-- Events Januari 2026
('ACR001', 'Bazar UMKM Januari 2026', 'Bazar UMKM untuk memperkenalkan produk lokal ke masyarakat luas. Gratis untuk pelaku UMKM yang mendaftar.', '2026-01-20', 50, '2026-01-15'),
('ACR002', 'Workshop Pemasaran Digital UMKM', 'Pelatihan pemasaran digital untuk UMKM meliputi social media marketing, iklan online, dan strategi konten.', '2026-01-25', 100, '2026-01-18'),

-- Events Februari 2026
('ACR003', 'Festival Kuliner Nusantara', 'Festival kuliner dari berbagai daerah di Indonesia. Ratusan UMKM kuliner akan berpartisipasi.', '2026-02-05', 75, '2026-01-28'),
('ACR004', 'Pelatihan Fotografi Produk', 'Pelatihan fotografi produk untuk meningkatkan daya tarik visual produk UMKM di e-commerce.', '2026-02-12', 60, '2026-02-05'),
('ACR005', 'Expo Fashion Muslim 2026', 'Pameran fashion muslim terbesar dengan berbagai produk hijab, gamis, dan aksesoris muslim.', '2026-02-18', 80, '2026-02-10'),

-- Events Maret 2026
('ACR006', 'Seminar Keuangan Untuk UMKM', 'Seminar mengelola keuangan bisnis, laporan keuangan sederhana, dan tips mengajukan kredit UMKM.', '2026-03-08', 150, '2026-03-01'),
('ACR007', 'Pameran Kerajinan Tangan Indonesia', 'Pameran kerajinan tangan dari seluruh Indonesia. Batik, tenun, anyaman, dan lainnya.', '2026-03-15', 90, '2026-03-08'),
('ACR008', 'Workshop Branding UMKM', 'Workshop membangun brand identity untuk UMKM, termasuk logo design dan packaging.', '2026-03-22', 120, '2026-03-15'),

-- Events April 2026
('ACR009', 'Bazar Ramadan UMKM 2026', 'Bazar khusus produk Ramadan dan Lebaran. Makanan, fashion, hingga hampers.', '2026-04-10', 100, '2026-04-03'),
('ACR010', 'Pelatihan E-Commerce untuk Pemula', 'Pelatihan menggunakan platform e-commerce seperti Shopee, Tokopedia, dan Bukalapak.', '2026-04-18', 80, '2026-04-10'),

-- Events Mei 2026
('ACR011', 'Festival Kopi Nusantara', 'Festival kopi dengan berbagai jenis kopi dari Sabang sampai Merauke. Coffee cupping dan competition.', '2026-05-05', 60, '2026-04-28'),
('ACR012', 'Workshop Legalitas Usaha UMKM', 'Workshop tentang pentingnya legalitas usaha, cara mengurus NIB, NPWP, dan izin usaha lainnya.', '2026-05-15', 100, '2026-05-08'),

-- Events Juni 2026
('ACR013', 'Pameran Furniture & Home Decor', 'Pameran furniture dan home decor dari UMKM Indonesia. Berbagai gaya dari minimalis hingga klasik.', '2026-06-08', 70, '2026-06-01'),
('ACR014', 'Pelatihan Customer Service Excellence', 'Pelatihan memberikan pelayanan pelanggan terbaik untuk meningkatkan kepuasan dan loyalitas customer.', '2026-06-20', 150, '2026-06-13'),

-- Events Juli 2026
('ACR015', 'Bazar UMKM Mid Year Sale', 'Bazar UMKM dengan berbagai diskon dan promo menarik. Saatnya belanja produk lokal dengan harga terbaik!', '2026-07-12', 85, '2026-07-05'),
('ACR016', 'Workshop Packaging Design', 'Workshop membuat packaging menarik yang meningkatkan nilai jual produk UMKM.', '2026-07-20', 75, '2026-07-13')
ON DUPLICATE KEY UPDATE `namaacara` = VALUES(`namaacara`);

-- ============================================================
-- SELESAI - Data dummy berhasil dibuat!
-- ============================================================
-- Total Data Berhasil Ditambahkan:
-- - 5 Kategori UMKM
-- - 8 Pengguna (UMKM Owners)
-- - 8 UMKM Businesses
-- - 52 Produk dari berbagai kategori
-- - 16 Events/Acara dari Januari - Juli 2026
-- ============================================================
