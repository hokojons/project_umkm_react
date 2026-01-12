<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$categories = \DB::table('categories')->select('id', 'nama_kategori')->get();

if ($categories->count() > 0) {
    echo "Categories:\n";
    foreach ($categories as $cat) {
        echo "ID: {$cat->id} - {$cat->nama_kategori}\n";
    }
} else {
    echo "No categories found.\n";
}
