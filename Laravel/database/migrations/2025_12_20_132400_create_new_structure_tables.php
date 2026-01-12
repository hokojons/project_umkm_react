<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Tabel untuk request upgrade role user -> umkm
        Schema::create('role_upgrade_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('nama_pemilik', 100);
            $table->string('nama_toko', 100);
            $table->string('alamat_toko', 200);
            $table->unsignedBigInteger('kategori_id');
            $table->enum('status_pengajuan', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('alasan_pengajuan')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('kategori_id')->references('id')->on('categories')->onDelete('restrict');
        });

        // Tabel UMKM yang sudah disetujui
        Schema::create('tumkm', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('nama_toko', 255);
            $table->string('nama_pemilik', 100);
            $table->text('deskripsi');
            $table->unsignedBigInteger('kategori_id');
            $table->string('whatsapp', 20)->nullable();
            $table->string('telepon', 20)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('instagram', 100)->nullable();
            $table->string('alamat', 200)->nullable();
            $table->string('kota', 100)->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->enum('status', ['pending', 'active', 'inactive', 'rejected'])->default('pending');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('kategori_id')->references('id')->on('categories')->onDelete('restrict');
        });

        // Tabel Produk
        Schema::create('tproduk', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('umkm_id');
            $table->string('nama_produk', 255);
            $table->text('deskripsi')->nullable();
            $table->decimal('harga', 10, 2);
            $table->string('kategori', 50)->nullable();
            $table->integer('stok')->default(100);
            $table->string('gambar', 255)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->foreign('umkm_id')->references('id')->on('tumkm')->onDelete('cascade');
        });

        // Tabel Event (untuk admin)
        Schema::create('tadmin_events', function (Blueprint $table) {
            $table->string('kode_event', 20)->primary();
            $table->string('nama_event', 150);
            $table->text('deskripsi')->nullable();
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->string('foto_url', 255)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tadmin_events');
        Schema::dropIfExists('tproduk');
        Schema::dropIfExists('tumkm');
        Schema::dropIfExists('role_upgrade_requests');
    }
};
