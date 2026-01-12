<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'nama_kategori' => 'Makanan & Minuman',
                'deskripsi' => 'Produk makanan dan minuman lokal',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Fashion & Aksesoris',
                'deskripsi' => 'Pakaian, tas, dan aksesoris',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Kerajinan Tangan',
                'deskripsi' => 'Produk kerajinan tangan dan handicraft',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Kecantikan & Kesehatan',
                'deskripsi' => 'Produk kecantikan dan kesehatan alami',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Elektronik & Gadget',
                'deskripsi' => 'Aksesoris elektronik dan gadget',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('tkategori')->insert($categories);

        $this->command->info('✅ Categories seeded successfully!');
    }
}
