<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== CHECKING DATABASE ===\n\n";

echo "=== USERS TABLE ===\n";
$users = DB::table('users')->get();
echo "Total users: " . $users->count() . "\n";
foreach ($users as $user) {
    echo "  - {$user->email} (Role: {$user->role})\n";
}

echo "\n=== TADMIN TABLE ===\n";
$admins = DB::table('tadmin')->get();
echo "Total admins: " . $admins->count() . "\n";
foreach ($admins as $admin) {
    echo "  - {$admin->email} (Username: {$admin->username})\n";
}

echo "\n=== TACARA TABLE ===\n";
$events = DB::table('tacara')->get();
echo "Total events: " . $events->count() . "\n";
foreach ($events as $event) {
    echo "  - {$event->namaacara}\n";
}

echo "\n=== TPENGGUNA TABLE ===\n";
$participants = DB::table('tpengguna')->get();
echo "Total participants: " . $participants->count() . "\n";
foreach ($participants as $p) {
    echo "  - {$p->namalengkap}\n";
}
