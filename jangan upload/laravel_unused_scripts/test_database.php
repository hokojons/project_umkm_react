<?php
// Simple database connection test
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    DB::connection()->getPdo();
    echo "✓ Database connection successful!\n";
    echo "Database: " . DB::connection()->getDatabaseName() . "\n";
    
    // Test tables
    $tables = DB::select('SHOW TABLES');
    echo "\n✓ Tables found: " . count($tables) . "\n";
    
    // Check users table
    $userCount = DB::table('users')->count();
    echo "✓ Users table: " . $userCount . " records\n";
    
    // Check umkm table
    $umkmCount = DB::table('umkm')->count();
    echo "✓ UMKM table: " . $umkmCount . " records\n";
    
    // Check products table
    $productCount = DB::table('products')->count();
    echo "✓ Products table: " . $productCount . " records\n";
    
    echo "\n✓ All tests passed! Database is ready.\n";
    
} catch (\Exception $e) {
    echo "✗ Database connection failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
}
