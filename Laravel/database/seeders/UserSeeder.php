<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            // Admin users
            [
                'name' => 'Super Admin',
                'email' => 'admin@umkm.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '081234567890',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Admin Marketplace',
                'email' => 'admin2@umkm.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '081234567891',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // UMKM Owners
            [
                'name' => 'Budi Santoso',
                'email' => 'budi@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678001',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678002',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ahmad Wijaya',
                'email' => 'ahmad@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678003',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rudi Hartono',
                'email' => 'rudi@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678005',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Maya Sari',
                'email' => 'maya@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678006',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Agus Prasetyo',
                'email' => 'agus@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678007',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rina Kusuma',
                'email' => 'rina@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678008',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Doni Setiawan',
                'email' => 'doni@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678009',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Lisa Permata',
                'email' => 'lisa@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'umkm_owner',
                'phone' => '0812345678010',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Customers
            [
                'name' => 'Customer Satu',
                'email' => 'customer1@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '0898765432001',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Customer Dua',
                'email' => 'customer2@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '0898765432002',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Customer Tiga',
                'email' => 'customer3@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '0898765432003',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Customer Empat',
                'email' => 'customer4@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '0898765432004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Customer Lima',
                'email' => 'customer5@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '0898765432005',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('users')->insert($users);

        $this->command->info('✅ Users seeded successfully!');
        $this->command->info('   - Admins: 2');
        $this->command->info('   - UMKM Owners: 10');
        $this->command->info('   - Customers: 5');
        $this->command->info('   📧 Login credentials: [email] / password');
    }
}
