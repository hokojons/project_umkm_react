<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== TADMIN TABLE STRUCTURE ===\n\n";
$cols = DB::select('SHOW COLUMNS FROM tadmin');
foreach($cols as $c) {
    echo $c->Field . " (" . $c->Type . ")\n";
}
