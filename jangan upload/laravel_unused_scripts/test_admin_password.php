<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

echo "=== Checking Admin Password ===\n\n";

$admin = Admin::where('email', 'admin@pasar.com')->first();

if (!$admin) {
    echo "❌ Admin tidak ditemukan!\n\n";
    echo "Mencoba mencari semua admin...\n";
    $allAdmins = Admin::all();
    foreach ($allAdmins as $a) {
        echo "- ID: {$a->id}, Email: {$a->email}, Nama: {$a->nama}\n";
    }
} else {
    echo "✅ Admin ditemukan!\n";
    echo "ID: {$admin->id}\n";
    echo "Email: {$admin->email}\n";
    echo "Nama: {$admin->nama}\n";
    echo "Status: {$admin->status}\n";
    echo "Password Hash: {$admin->password}\n\n";

    // Test beberapa password yang mungkin
    $passwords = ['admin123', 'password', '123456', 'admin', 'Admin@123'];

    echo "Testing passwords:\n";
    foreach ($passwords as $pass) {
        $match = Hash::check($pass, $admin->password);
        echo "- '{$pass}': " . ($match ? "✅ MATCH" : "❌") . "\n";
    }
}
