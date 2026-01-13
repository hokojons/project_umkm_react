<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DummyEventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'kodeacara' => 'EVT001',
                'namaacara' => 'Festival UMKM Nusantara 2026',
                'detail' => 'Festival UMKM terbesar di Indonesia yang menghadirkan lebih dari 200 pelaku UMKM dari seluruh nusantara. Nikmati berbagai produk lokal berkualitas, workshop kewirausahaan, talkshow dengan pengusaha sukses, dan hiburan seni budaya. Tersedia juga area food court dengan kuliner khas daerah. Gratis untuk umum!',
                'tanggal' => '2026-02-15',
                'kuotapeserta' => 500,
                'tanggaldaftar' => '2026-01-10',
                'lokasi' => 'Jakarta Convention Center, Hall A-C, Senayan, Jakarta Pusat',
                'gambar' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
                'gambar_position_x' => 0,
                'gambar_position_y' => 0,
                'gambar_scale' => 1.0,
                'status' => 'active',
            ],
            [
                'kodeacara' => 'EVT002',
                'namaacara' => 'Workshop Digital Marketing untuk UMKM',
                'detail' => 'Pelatihan intensif selama 2 hari tentang strategi pemasaran digital untuk pelaku UMKM. Materi mencakup: Social Media Marketing, Facebook & Instagram Ads, Google Ads, SEO dasar, Content Creation, dan analisis data. Peserta akan mendapat sertifikat dan konsultasi gratis selama 1 bulan setelah workshop. Instruktur berpengalaman dari praktisi digital marketing.',
                'tanggal' => '2026-02-22',
                'kuotapeserta' => 50,
                'tanggaldaftar' => '2026-01-15',
                'lokasi' => 'Hotel Santika Premiere, Ruang Anggrek, Jl. Pandanaran No. 116, Semarang',
                'gambar' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
                'gambar_position_x' => 0,
                'gambar_position_y' => 0,
                'gambar_scale' => 1.0,
                'status' => 'active',
            ],
            [
                'kodeacara' => 'EVT003',
                'namaacara' => 'Pameran Batik & Tenun Indonesia',
                'detail' => 'Pameran eksklusif yang menampilkan keindahan batik tulis dan tenun dari berbagai daerah Indonesia. Lebih dari 100 pengrajin akan memamerkan karya terbaik mereka. Tersedia demo membatik langsung, workshop pewarnaan alami, dan fashion show batik kontemporer. Pengunjung berkesempatan membeli langsung dari pengrajin dan mendukung pelestarian warisan budaya Indonesia.',
                'tanggal' => '2026-03-01',
                'kuotapeserta' => 300,
                'tanggaldaftar' => '2026-02-01',
                'lokasi' => 'Bentara Budaya Yogyakarta, Jl. Suroto No. 2, Kotabaru, Yogyakarta',
                'gambar' => 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
                'gambar_position_x' => 0,
                'gambar_position_y' => 0,
                'gambar_scale' => 1.0,
                'status' => 'active',
            ],
            [
                'kodeacara' => 'EVT004',
                'namaacara' => 'Seminar Akses Permodalan UMKM',
                'detail' => 'Seminar gratis yang membahas berbagai opsi permodalan untuk UMKM: KUR (Kredit Usaha Rakyat), P2P Lending, Venture Capital, dan Angel Investor. Narasumber dari Bank Indonesia, OJK, dan fintech ternama akan berbagi tips pengajuan pinjaman yang berhasil, cara menyusun proposal bisnis, dan manajemen keuangan UMKM. Sesi networking dengan lembaga keuangan juga tersedia.',
                'tanggal' => '2026-03-10',
                'kuotapeserta' => 150,
                'tanggaldaftar' => '2026-02-20',
                'lokasi' => 'Aula Bank Indonesia Surabaya, Jl. Pahlawan No. 105, Surabaya',
                'gambar' => 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
                'gambar_position_x' => 0,
                'gambar_position_y' => 0,
                'gambar_scale' => 1.0,
                'status' => 'active',
            ],
            [
                'kodeacara' => 'EVT005',
                'namaacara' => 'Bazar Kuliner Tradisional',
                'detail' => 'Bazar kuliner yang menghadirkan 75 stan makanan dan minuman tradisional dari berbagai daerah Indonesia. Nikmati rendang Padang, sate Madura, gudeg Jogja, rawon Surabaya, dan masih banyak lagi! Ada juga kompetisi memasak antar UMKM kuliner, demo masak oleh chef ternama, dan pertunjukan musik tradisional. Cocok untuk keluarga dan pecinta kuliner otentik Indonesia.',
                'tanggal' => '2026-03-20',
                'kuotapeserta' => 1000,
                'tanggaldaftar' => '2026-02-25',
                'lokasi' => 'Lapangan Parkir Timur Senayan, Jakarta Selatan',
                'gambar' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
                'gambar_position_x' => 0,
                'gambar_position_y' => 0,
                'gambar_scale' => 1.0,
                'status' => 'active',
            ],
            [
                'kodeacara' => 'EVT006',
                'namaacara' => 'Pelatihan Ekspor untuk UMKM',
                'detail' => 'Program pelatihan komprehensif bagi UMKM yang ingin go international. Materi meliputi: prosedur ekspor, dokumen yang diperlukan, standar kualitas internasional, packaging untuk ekspor, marketplace global (Amazon, Alibaba, Etsy), dan regulasi bea cukai. Peserta akan mendapat pendampingan dari Kementerian Perdagangan dan akses ke buyer internasional. Kuota terbatas!',
                'tanggal' => '2026-04-05',
                'kuotapeserta' => 40,
                'tanggaldaftar' => '2026-03-01',
                'lokasi' => 'Gedung BPPT, Lt. 3 Ruang Inovasi, Jl. M.H. Thamrin No. 8, Jakarta',
                'gambar' => 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800',
                'gambar_position_x' => 0,
                'gambar_position_y' => 0,
                'gambar_scale' => 1.0,
                'status' => 'active',
            ],
            [
                'kodeacara' => 'EVT007',
                'namaacara' => 'Festival Kopi Nusantara',
                'detail' => 'Festival tahunan yang merayakan kekayaan kopi Indonesia. Hadir 50+ roaster dan petani kopi dari Aceh hingga Papua. Nikmati cupping session, latte art competition, brewing workshop, dan diskusi tentang sustainable coffee. Pengunjung dapat mencicipi berbagai single origin Indonesia dan membeli langsung dari petani. Live music dan area foto estetik tersedia. Wajib dikunjungi para pecinta kopi!',
                'tanggal' => '2026-04-18',
                'kuotapeserta' => 400,
                'tanggaldaftar' => '2026-03-15',
                'lokasi' => 'Gedung Kreatif Bandung, Jl. Laswi No. 7, Bandung',
                'gambar' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
                'gambar_position_x' => 0,
                'gambar_position_y' => 0,
                'gambar_scale' => 1.0,
                'status' => 'active',
            ],
        ];

        // Clear existing dummy events (keep any real user data by only deleting EVT* codes)
        DB::table('tacara')->where('kodeacara', 'like', 'EVT%')->delete();

        foreach ($events as $event) {
            $event['created_at'] = now();
            $event['updated_at'] = now();
            
            DB::table('tacara')->insert($event);
            
            $this->command->info("Created Event: {$event['namaacara']}");
        }
        
        $this->command->info("✅ Successfully created 7 dummy events!");
    }
}
