<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "========== STRUKTUR TABLE USERS ==========\n\n";

$columns = DB::select('DESCRIBE users');
foreach ($columns as $col) {
    echo sprintf(
        "%-20s %-20s %-10s %-20s\n",
        $col->Field,
        $col->Type,
        $col->Null,
        $col->Default ?? 'NULL'
    );
}

echo "\n========== SAMPLE USER DATA ==========\n\n";
$user = DB::table('users')->first();
if ($user) {
    echo json_encode($user, JSON_PRETTY_PRINT);
} else {
    echo "No users found\n";
}
