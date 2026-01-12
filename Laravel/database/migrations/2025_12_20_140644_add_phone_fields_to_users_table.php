<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('telepon', 20)->nullable()->unique()->after('email');
            $table->string('alamat', 255)->nullable()->after('status');
            $table->string('kota', 100)->nullable()->after('alamat');
            $table->string('kode_pos', 10)->nullable()->after('kota');
            $table->string('role', 20)->default('user')->after('kode_pos'); // user, umkm, admin
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telepon', 'alamat', 'kota', 'kode_pos', 'role']);
        });
    }
};
