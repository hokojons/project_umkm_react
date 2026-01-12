<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║     SEEDING UMKM PHOTOS & PRODUCTS WITH IMAGES              ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Sample product images (base64 encoded 1x1 pixel images as placeholders)
// In a real scenario, you would use actual product images
$sampleImages = [
    'kue' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
    'batik' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
    'kerajinan' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
    'kopi' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
    'tas' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
];

$tokoImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

// Get all UMKM
$umkms = DB::table('tumkm')->get();

if ($umkms->isEmpty()) {
    echo "❌ Tidak ada UMKM dalam database!\n";
    exit;
}

echo "Found " . count($umkms) . " UMKM businesses\n\n";

// Update UMKM photos first
echo "═══════════════════════════════════════════════════════════════\n";
echo "STEP 1: Updating UMKM Photos\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

foreach ($umkms as $umkm) {
    DB::table('tumkm')
        ->where('id', $umkm->id)
        ->update(['foto_toko' => $tokoImage]);
    
    echo "✓ Updated photo for: {$umkm->nama_toko}\n";
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "STEP 2: Creating Products with Photos\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

// Define products for each UMKM
$productsData = [
    'Toko Kue Lestari' => [
        ['nama' => 'Kue Nastar Premium', 'harga' => 75000, 'kategori' => 'Makanan', 'stok' => 50, 'deskripsi' => 'Kue nastar dengan selai nanas pilihan, lumer di mulut dengan rasa manis yang pas. Cocok untuk hampers atau konsumsi pribadi.', 'gambar' => 'kue'],
        ['nama' => 'Brownies Coklat Kukus', 'harga' => 50000, 'kategori' => 'Makanan', 'stok' => 30, 'deskripsi' => 'Brownies kukus lembut dengan coklat premium Belgium. Tanpa pengawet dan dibuat fresh setiap hari.', 'gambar' => 'kue'],
        ['nama' => 'Kue Lapis Legit', 'harga' => 150000, 'kategori' => 'Makanan', 'stok' => 20, 'deskripsi' => 'Lapis legit original dengan 18 lapis, menggunakan butter dan kuning telur asli. Rasa manis dan gurih yang sempurna.', 'gambar' => 'kue'],
        ['nama' => 'Cookies Coklat Chip', 'harga' => 35000, 'kategori' => 'Makanan', 'stok' => 60, 'deskripsi' => 'Cookies renyah dengan chocolate chip yang melimpah. Tekstur crunchy di luar dan lembut di dalam.', 'gambar' => 'kue'],
        ['nama' => 'Bolu Pandan Keju', 'harga' => 45000, 'kategori' => 'Makanan', 'stok' => 40, 'deskripsi' => 'Bolu pandan dengan taburan keju melimpah. Aroma pandan yang harum dan rasa keju yang gurih.', 'gambar' => 'kue'],
        ['nama' => 'Kue Putri Salju', 'harga' => 55000, 'kategori' => 'Makanan', 'stok' => 45, 'deskripsi' => 'Kue putri salju yang lembut dengan taburan gula halus. Rasa manis vanilla yang lezat.', 'gambar' => 'kue'],
    ],
    'Fashion Batik Jaya' => [
        ['nama' => 'Kemeja Batik Pria Slim Fit', 'harga' => 250000, 'kategori' => 'Fashion', 'stok' => 25, 'deskripsi' => 'Kemeja batik pria modern dengan cutting slim fit, motif batik kontemporer. Bahan katun premium yang nyaman dan breathable.', 'gambar' => 'batik'],
        ['nama' => 'Dress Batik Wanita Kombinasi', 'harga' => 320000, 'kategori' => 'Fashion', 'stok' => 18, 'deskripsi' => 'Dress batik wanita dengan kombinasi polos modern. Cocok untuk acara formal maupun semi formal.', 'gambar' => 'batik'],
        ['nama' => 'Blouse Batik Cap Tulis', 'harga' => 180000, 'kategori' => 'Fashion', 'stok' => 30, 'deskripsi' => 'Blouse batik kombinasi cap dan tulis dengan detail jahitan rapi. Desain elegan untuk wanita modern.', 'gambar' => 'batik'],
        ['nama' => 'Sarung Batik Premium', 'harga' => 150000, 'kategori' => 'Fashion', 'stok' => 35, 'deskripsi' => 'Sarung batik dengan kain halus dan motif tradisional. Cocok untuk berbagai acara adat dan keagamaan.', 'gambar' => 'batik'],
        ['nama' => 'Outer Batik Cardigan', 'harga' => 200000, 'kategori' => 'Fashion', 'stok' => 22, 'deskripsi' => 'Cardigan batik modern yang bisa dikombinasikan dengan berbagai outfit. Bahan adem dan nyaman.', 'gambar' => 'batik'],
        ['nama' => 'Rok Batik A-Line', 'harga' => 165000, 'kategori' => 'Fashion', 'stok' => 28, 'deskripsi' => 'Rok batik dengan potongan A-line yang flattering. Cocok untuk acara kantor atau pesta.', 'gambar' => 'batik'],
    ],
    'Kerajinan Bambu Indah' => [
        ['nama' => 'Lampion Bambu Ukir', 'harga' => 125000, 'kategori' => 'Kerajinan', 'stok' => 15, 'deskripsi' => 'Lampion bambu dengan ukiran detail, memberikan cahaya hangat dan estetik. Cocok untuk dekorasi rumah atau cafe.', 'gambar' => 'kerajinan'],
        ['nama' => 'Vas Bunga Bambu Minimalis', 'harga' => 85000, 'kategori' => 'Kerajinan', 'stok' => 25, 'deskripsi' => 'Vas bunga dari bambu dengan desain minimalis modern. Tahan lama dan ramah lingkungan.', 'gambar' => 'kerajinan'],
        ['nama' => 'Keranjang Bambu Serbaguna', 'harga' => 65000, 'kategori' => 'Kerajinan', 'stok' => 40, 'deskripsi' => 'Keranjang bambu anyaman rapi untuk penyimpanan atau dekorasi. Kuat dan awet.', 'gambar' => 'kerajinan'],
        ['nama' => 'Tempat Pensil Bambu Etnik', 'harga' => 45000, 'kategori' => 'Kerajinan', 'stok' => 50, 'deskripsi' => 'Tempat pensil bambu dengan motif etnik khas Indonesia. Cocok untuk hadiah atau souvenir.', 'gambar' => 'kerajinan'],
        ['nama' => 'Nampan Bambu Vintage', 'harga' => 95000, 'kategori' => 'Kerajinan', 'stok' => 30, 'deskripsi' => 'Nampan bambu dengan finishing vintage yang elegan. Praktis untuk menyajikan makanan atau minuman.', 'gambar' => 'kerajinan'],
        ['nama' => 'Kotak Tisu Bambu Natural', 'harga' => 55000, 'kategori' => 'Kerajinan', 'stok' => 35, 'deskripsi' => 'Kotak tisu dari bambu alami dengan finishing halus. Menambah kesan natural di ruangan.', 'gambar' => 'kerajinan'],
        ['nama' => 'Hiasan Dinding Bambu 3D', 'harga' => 175000, 'kategori' => 'Kerajinan', 'stok' => 12, 'deskripsi' => 'Hiasan dinding bambu dengan efek 3D yang artistik. Statement piece untuk ruang tamu atau kantor.', 'gambar' => 'kerajinan'],
    ],
    'Warung Kopi Nusantara' => [
        ['nama' => 'Kopi Arabica Gayo 200gr', 'harga' => 85000, 'kategori' => 'Minuman', 'stok' => 50, 'deskripsi' => 'Kopi arabica asli Gayo dengan cita rasa khas dan aroma yang harum. Medium roast untuk taste profile optimal.', 'gambar' => 'kopi'],
        ['nama' => 'Kopi Robusta Lampung 200gr', 'harga' => 65000, 'kategori' => 'Minuman', 'stok' => 60, 'deskripsi' => 'Robusta Lampung dengan body kuat dan caffeine tinggi. Cocok untuk pecinta kopi strong.', 'gambar' => 'kopi'],
        ['nama' => 'Kopi Luwak 100gr', 'harga' => 350000, 'kategori' => 'Minuman', 'stok' => 10, 'deskripsi' => 'Kopi luwak premium dengan proses alami. Rasa smooth dan aroma eksotis yang khas.', 'gambar' => 'kopi'],
        ['nama' => 'Kopi Toraja 200gr', 'harga' => 95000, 'kategori' => 'Minuman', 'stok' => 45, 'deskripsi' => 'Kopi Toraja dengan karakteristik earthy dan nutty. Full body dengan after taste yang panjang.', 'gambar' => 'kopi'],
        ['nama' => 'Kopi Espresso Blend 250gr', 'harga' => 110000, 'kategori' => 'Minuman', 'stok' => 35, 'deskripsi' => 'Blend khusus untuk espresso dengan crema yang thick. Balanced antara acidity dan sweetness.', 'gambar' => 'kopi'],
        ['nama' => 'Cold Brew Coffee Pack', 'harga' => 75000, 'kategori' => 'Minuman', 'stok' => 40, 'deskripsi' => 'Special blend untuk cold brew dengan hasil yang smooth. Tinggal seduh dengan air dingin.', 'gambar' => 'kopi'],
    ],
    'Tas Rajut Cantik' => [
        ['nama' => 'Tas Rajut Selempang Pastel', 'harga' => 135000, 'kategori' => 'Fashion', 'stok' => 20, 'deskripsi' => 'Tas rajut selempang dengan warna pastel yang trendy. Rajutan rapi dan tali adjustable.', 'gambar' => 'tas'],
        ['nama' => 'Tote Bag Rajut Besar', 'harga' => 165000, 'kategori' => 'Fashion', 'stok' => 25, 'deskripsi' => 'Tote bag rajut berukuran besar, cocok untuk belanja atau kuliah. Kuat menampung barang banyak.', 'gambar' => 'tas'],
        ['nama' => 'Clutch Rajut Pesta', 'harga' => 95000, 'kategori' => 'Fashion', 'stok' => 30, 'deskripsi' => 'Clutch rajut elegant untuk acara pesta atau kondangan. Dengan aksen manik-manik cantik.', 'gambar' => 'tas'],
        ['nama' => 'Tas Ransel Rajut Mini', 'harga' => 175000, 'kategori' => 'Fashion', 'stok' => 18, 'deskripsi' => 'Tas ransel mini dengan rajutan detail. Cute dan fungsional untuk daily use.', 'gambar' => 'tas'],
        ['nama' => 'Tas Laptop Rajut 14 inch', 'harga' => 195000, 'kategori' => 'Fashion', 'stok' => 15, 'deskripsi' => 'Tas laptop rajut dengan padding protection. Stylish dan aman untuk laptop hingga 14 inch.', 'gambar' => 'tas'],
        ['nama' => 'Sling Bag Rajut Bulat', 'harga' => 125000, 'kategori' => 'Fashion', 'stok' => 22, 'deskripsi' => 'Sling bag dengan bentuk bulat yang unik. Rajutan rapi dan tali panjang adjustable.', 'gambar' => 'tas'],
        ['nama' => 'Tas Rajut Bucket', 'harga' => 145000, 'kategori' => 'Fashion', 'stok' => 28, 'deskripsi' => 'Tas model bucket dengan drawstring. Trendy dan spacious untuk berbagai keperluan.', 'gambar' => 'tas'],
    ],
];

$totalProducts = 0;

foreach ($umkms as $umkm) {
    $namaUmkm = $umkm->nama_toko;
    
    if (!isset($productsData[$namaUmkm])) {
        echo "⚠ No products defined for: $namaUmkm\n";
        continue;
    }
    
    echo "\n━━━ $namaUmkm (ID: {$umkm->id}) ━━━\n";
    
    foreach ($productsData[$namaUmkm] as $product) {
        $gambarType = $product['gambar'];
        $gambarData = $sampleImages[$gambarType] ?? $sampleImages['kue'];
        
        try {
            DB::table('tproduk')->insert([
                'umkm_id' => $umkm->id,
                'nama_produk' => $product['nama'],
                'deskripsi' => $product['deskripsi'],
                'harga' => $product['harga'],
                'kategori' => $product['kategori'],
                'stok' => $product['stok'],
                'gambar' => $gambarData,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            echo "  ✓ {$product['nama']} - Rp " . number_format($product['harga'], 0, ',', '.') . " (Stock: {$product['stok']})\n";
            $totalProducts++;
            
        } catch (\Exception $e) {
            echo "  ✗ Failed: {$product['nama']} - {$e->getMessage()}\n";
        }
    }
}

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║                      SUMMARY                                 ║\n";
echo "╠══════════════════════════════════════════════════════════════╣\n";
echo "║  UMKM Updated with Photos: " . str_pad(count($umkms), 26) . "║\n";
echo "║  Total Products Created: " . str_pad($totalProducts, 28) . "║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

echo "✅ All UMKM photos and products have been successfully populated!\n\n";
