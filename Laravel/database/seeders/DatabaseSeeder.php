<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create categories
        DB::table('categories')->insert([
            ['nama_kategori' => 'Makanan & Minuman', 'icon' => '🍔', 'created_at' => now(), 'updated_at' => now()],
            ['nama_kategori' => 'Kerajinan', 'icon' => '🎨', 'created_at' => now(), 'updated_at' => now()],
            ['nama_kategori' => 'Fashion', 'icon' => '👗', 'created_at' => now(), 'updated_at' => now()],
            ['nama_kategori' => 'Elektronik', 'icon' => '💻', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Create admin user
        DB::table('admins')->insert([
            'email' => 'admin@pasar.com',
            'nama' => 'Administrator',
            'password' => Hash::make('admin123'),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Create sample users for testing
        DB::table('users')->insert([
            [
                'name' => 'User Test',
                'email' => 'user@test.com',
                'telepon' => '6281234567890',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'status' => 'active',
                'alamat' => 'Jl. Test No. 1',
                'kota' => 'Jakarta',
                'kode_pos' => '12345',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'UMKM Test',
                'email' => 'umkm@test.com',
                'telepon' => '6281234567891',
                'password' => Hash::make('password123'),
                'role' => 'umkm',
                'status' => 'active',
                'alamat' => 'Jl. Test No. 2',
                'kota' => 'Bandung',
                'kode_pos' => '40123',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}
