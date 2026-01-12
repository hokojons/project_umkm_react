<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabel untuk komentar penolakan produk
        Schema::create('product_rejection_comments', function (Blueprint $table) {
            $table->id();
            $table->string('kodeproduk', 20);
            $table->string('kodepengguna', 20);
            $table->text('comment');
            $table->enum('status', ['rejected', 'pending'])->default('rejected');
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->timestamps();

            $table->index('kodeproduk');
            $table->index('kodepengguna');
        });

        // Tabel untuk komentar penolakan UMKM store
        Schema::create('umkm_rejection_comments', function (Blueprint $table) {
            $table->id();
            $table->string('kodepengguna', 20);
            $table->text('comment');
            $table->enum('status', ['rejected', 'pending'])->default('rejected');
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->timestamps();

            $table->index('kodepengguna');
        });

        // Tambah kolom untuk track status produk individual
        Schema::table('tproduk', function (Blueprint $table) {
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tproduk', function (Blueprint $table) {
            $table->dropColumn('approval_status');
        });
        
        Schema::dropIfExists('umkm_rejection_comments');
        Schema::dropIfExists('product_rejection_comments');
    }
};
