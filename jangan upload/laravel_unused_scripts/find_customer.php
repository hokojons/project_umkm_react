<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$customer = \DB::table('users')
    ->select('id', 'nama_lengkap', 'email', 'role')
    ->where('role', 'customer')
    ->first();

if ($customer) {
    echo "Found customer user:\n";
    echo "ID: {$customer->id}\n";
    echo "Name: {$customer->nama_lengkap}\n";
    echo "Email: {$customer->email}\n";
    echo "Role: {$customer->role}\n";
} else {
    echo "No customer users found.\n";
}
