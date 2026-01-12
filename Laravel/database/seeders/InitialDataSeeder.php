<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class InitialDataSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Categories
        $existingCategories = DB::table('categories')->count();
        if ($existingCategories == 0) {
            DB::table('categories')->insert([
                ['id' => 'CAT001', 'nama_kategori' => 'Makanan', 'icon' => '🍔', 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT002', 'nama_kategori' => 'Minuman', 'icon' => '☕', 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT003', 'nama_kategori' => 'Snack', 'icon' => '🍿', 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT004', 'nama_kategori' => 'Kerajinan', 'icon' => '🎨', 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT005', 'nama_kategori' => 'Fashion', 'icon' => '👕', 'created_at' => now(), 'updated_at' => now()],
            ]);
            echo "✅ Categories seeded\n";
        } else {
            echo "⏭️  Categories already exist, skipping\n";
        }

        // Seed Admin
        $existingAdmin = DB::table('admins')->where('email', 'admin@pasar.com')->first();
        if (!$existingAdmin) {
            DB::table('admins')->insert([
                'email' => 'admin@pasar.com',
                'nama' => 'Admin Pasar UMKM',
                'password' => Hash::make('admin123'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            echo "✅ Admin created (email: admin@pasar.com, password: admin123)\n";
        } else {
            echo "⏭️  Admin already exists, skipping\n";
        }

        echo "\n📝 Note: Users harus register via WhatsApp OTP\n";
    }
}
