<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Cek & Populate Event Database ===\n\n";

// Check current events
$events = DB::table('tacara')->get();
echo "Jumlah event saat ini: " . $events->count() . "\n\n";

if ($events->count() > 0) {
    echo "Event yang ada:\n";
    foreach ($events as $event) {
        echo "- {$event->kodeacara}: {$event->namaacara}\n";
    }
} else {
    echo "Tidak ada event. Membuat sample events...\n\n";
    
    DB::table('tacara')->insert([
        [
            'kodeacara' => 'E001',
            'namaacara' => 'Pasar Ramadan 2026',
            'detail' => 'Event pasar ramadan terbesar untuk UMKM. Kesempatan berjualan langsung ke ribuan pengunjung dengan booth gratis!',
            'tanggal' => '2026-03-15',
            'kuotapeserta' => 50,
            'tanggaldaftar' => '2026-02-01'
        ],
        [
            'kodeacara' => 'E002',
            'namaacara' => 'Bazar Hari Kemerdekaan',
            'detail' => 'Perayaan HUT RI dengan bazar UMKM lokal. Booth gratis untuk 100 UMKM pertama yang mendaftar!',
            'tanggal' => '2026-08-17',
            'kuotapeserta' => 100,
            'tanggaldaftar' => '2026-07-01'
        ],
        [
            'kodeacara' => 'E003',
            'namaacara' => 'Festival Kuliner Nusantara',
            'detail' => 'Festival kuliner terbesar tahun ini! Kesempatan promosi produk makanan dan minuman UMKM ke ribuan food lovers.',
            'tanggal' => '2026-05-20',
            'kuotapeserta' => 75,
            'tanggaldaftar' => '2026-04-15'
        ],
        [
            'kodeacara' => 'E004',
            'namaacara' => 'Pameran Kerajinan Lokal',
            'detail' => 'Pameran kerajinan tangan dan produk kreatif lokal. Networking dengan buyer dan media massa.',
            'tanggal' => '2026-06-10',
            'kuotapeserta' => 60,
            'tanggaldaftar' => '2026-05-01'
        ]
    ]);
    
    echo "✅ 4 event berhasil ditambahkan!\n\n";
    
    $events = DB::table('tacara')->get();
    echo "Event yang tersedia:\n";
    foreach ($events as $event) {
        echo "- {$event->kodeacara}: {$event->namaacara} (Tanggal: {$event->tanggal}, Kuota: {$event->kuotapeserta})\n";
    }
}
