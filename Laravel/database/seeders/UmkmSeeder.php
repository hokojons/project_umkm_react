<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UmkmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get user IDs (assuming users are seeded first)
        $users = DB::table('users')->where('role', 'umkm_owner')->get();
        
        $umkmData = [
            [
                'user_id' => $users[0]->id,
                'nama_toko' => 'Warung Kopi Nusantara',
                'nama_pemilik' => $users[0]->name,
                'deskripsi' => 'Menjual kopi lokal berkualitas tinggi dari berbagai daerah di Indonesia. Kami berkomitmen menghadirkan cita rasa kopi nusantara yang autentik.',
                'alamat_toko' => 'Jl. Sudirman No. 123, Jakarta',
                'kategori_id' => 1, // Makanan & Minuman
                'whatsapp' => '081234567001',
                'instagram' => '@warungkopinusantara',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $users[1]->id,
                'nama_toko' => 'Batik Jaya Fashion',
                'nama_pemilik' => $users[1]->name,
                'deskripsi' => 'Produsen batik tulis dan cap berkualitas. Kami menyediakan berbagai motif batik tradisional dan kontemporer untuk kebutuhan fashion Anda.',
                'alamat_toko' => 'Jl. Malioboro No. 45, Yogyakarta',
                'kategori_id' => 2, // Fashion & Aksesoris
                'whatsapp' => '081234567002',
                'instagram' => '@batikjayafashion',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1610487827834-64ce7c9b7ec8',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $users[2]->id,
                'nama_toko' => 'Tas Rajut Cantik',
                'nama_pemilik' => $users[2]->name,
                'deskripsi' => 'Tas rajut handmade dengan berbagai model dan warna. Setiap tas dibuat dengan penuh cinta dan perhatian terhadap detail.',
                'alamat_toko' => 'Jl. Ahmad Yani No. 78, Bandung',
                'kategori_id' => 3, // Kerajinan Tangan
                'whatsapp' => '081234567003',
                'instagram' => '@tasrajutcantik',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $users[3]->id,
                'nama_toko' => 'Keripik Singkong Renyah',
                'nama_pemilik' => $users[3]->name,
                'deskripsi' => 'Keripik singkong dengan berbagai varian rasa. Dibuat dari singkong pilihan dengan bumbu rahasia turun temurun.',
                'alamat_toko' => 'Jl. Gatot Subroto No. 234, Surabaya',
                'kategori_id' => 1, // Makanan & Minuman
                'whatsapp' => '081234567004',
                'instagram' => '@keripiksingkongrenyah',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1613919671781-5c9adf8c4154',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $users[4]->id,
                'nama_toko' => 'Sabun Herbal Alami',
                'nama_pemilik' => $users[4]->name,
                'deskripsi' => 'Sabun herbal alami dari bahan-bahan organik. Cocok untuk semua jenis kulit dan bebas bahan kimia berbahaya.',
                'alamat_toko' => 'Jl. Diponegoro No. 56, Semarang',
                'kategori_id' => 4, // Kecantikan & Kesehatan
                'whatsapp' => '081234567005',
                'instagram' => '@sabunherbalalami',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $users[5]->id,
                'nama_toko' => 'Kerajinan Bambu Indah',
                'nama_pemilik' => $users[5]->name,
                'deskripsi' => 'Aneka kerajinan dari bambu untuk dekorasi rumah dan kebutuhan sehari-hari. Ramah lingkungan dan tahan lama.',
                'alamat_toko' => 'Jl. Imam Bonjol No. 89, Solo',
                'kategori_id' => 3, // Kerajinan Tangan
                'whatsapp' => '081234567006',
                'instagram' => '@kerajinanbambuindah',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1553530666-ba11a7da3888',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $users[6]->id,
                'nama_toko' => 'Jajanan Tradisional Nusantara',
                'nama_pemilik' => $users[6]->name,
                'deskripsi' => 'Kue dan jajanan tradisional Indonesia. Dibuat dengan resep asli yang dijaga keasliannya dari generasi ke generasi.',
                'alamat_toko' => 'Jl. Pahlawan No. 12, Medan',
                'kategori_id' => 1, // Makanan & Minuman
                'whatsapp' => '081234567007',
                'instagram' => '@jajantradisional',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1563822249366-7dc348c7f4f8',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $users[7]->id,
                'nama_toko' => 'Aksesoris Handmade',
                'nama_pemilik' => $users[7]->name,
                'deskripsi' => 'Aksesoris unik buatan tangan seperti kalung, gelang, dan anting. Setiap produk adalah karya seni yang tak terulang.',
                'alamat_toko' => 'Jl. Veteran No. 67, Bali',
                'kategori_id' => 2, // Fashion & Aksesoris
                'whatsapp' => '081234567008',
                'instagram' => '@aksesorishandmade',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $users[8]->id,
                'nama_toko' => 'Minuman Herbal Sehat',
                'nama_pemilik' => $users[8]->name,
                'deskripsi' => 'Menyediakan berbagai jamu dan minuman herbal tradisional untuk kesehatan. Terbuat dari rempah-rempah pilihan.',
                'alamat_toko' => 'Jl. Gajah Mada No. 123, Semarang',
                'kategori_id' => 4, // Kecantikan & Kesehatan
                'whatsapp' => '081234567009',
                'instagram' => '@minumanherbalsehat',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1587231575576-afb9ca37a9f8',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $users[9]->id,
                'nama_toko' => 'Kue Kering Lezat',
                'nama_pemilik' => $users[9]->name,
                'deskripsi' => 'Aneka kue kering premium untuk lebaran dan acara spesial. Renyah, gurih, dan tahan lama.',
                'alamat_toko' => 'Jl. Hayam Wuruk No. 45, Jakarta',
                'kategori_id' => 1, // Makanan & Minuman
                'whatsapp' => '081234567010',
                'instagram' => '@kuekeringlezat',
                'status' => 'active',
                'foto_toko' => 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('tumkm')->insert($umkmData);

        $this->command->info('✅ UMKM stores seeded successfully!');
        $this->command->info('   - Total stores: ' . count($umkmData));
    }
}
