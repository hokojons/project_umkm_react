<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Admin;

Admin::create([
    'id' => 'ADM001',
    'nama' => 'Admin Pasar',
    'email' => 'admin@pasar.com',
    'password' => bcrypt('admin123'),
    'status' => 'active',
]);

echo "✅ Admin created: admin@pasar.com / admin123\n";
