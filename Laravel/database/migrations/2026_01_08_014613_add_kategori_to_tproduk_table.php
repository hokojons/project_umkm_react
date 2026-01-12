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
        Schema::table('tproduk', function (Blueprint $table) {
            // kategori already exists, only add items if not exists
            if (!Schema::hasColumn('tproduk', 'items')) {
                $table->text('items')->nullable()->after('kategori')->comment('JSON array untuk items dalam paket hadiah');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tproduk', function (Blueprint $table) {
            if (Schema::hasColumn('tproduk', 'items')) {
                $table->dropColumn('items');
            }
        });
    }
};
