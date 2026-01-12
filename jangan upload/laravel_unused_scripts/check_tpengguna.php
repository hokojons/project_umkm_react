<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Columns in tpengguna:\n";
echo "====================\n";
$columns = DB::select('DESCRIBE tpengguna');
foreach ($columns as $col) {
    echo $col->Field . ' (' . $col->Type . ")\n";
}

echo "\n\nSample data from tpengguna:\n";
echo "===========================\n";
$users = DB::table('tpengguna')->limit(5)->get();
foreach ($users as $user) {
    echo "kodepengguna: {$user->kodepengguna}, namapengguna: {$user->namapengguna}\n";
}

echo "\n\nChecking if U009 exists:\n";
echo "========================\n";
$user009 = DB::table('tpengguna')->where('kodepengguna', 'U009')->first();
if ($user009) {
    echo "U009 EXISTS: {$user009->namapengguna}\n";
} else {
    echo "U009 DOES NOT EXIST\n";
}

echo "\n\nChecking users table for user_id 9:\n";
echo "=====================================\n";
$user9 = DB::table('users')->where('id', 9)->first();
if ($user9) {
    $columns = (array)$user9;
    echo "User ID 9 found. Columns: " . implode(', ', array_keys($columns)) . "\n";
    print_r($user9);
} else {
    echo "User ID 9 DOES NOT EXIST\n";
}
