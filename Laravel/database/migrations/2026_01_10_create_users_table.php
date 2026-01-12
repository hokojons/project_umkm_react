<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Table already exists - skip
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('email')->unique();
                $table->string('password');
                $table->string('nama_lengkap');
                $table->string('no_telepon')->nullable();
                $table->enum('role', ['customer', 'umkm'])->default('customer');
                $table->enum('status', ['active', 'inactive', 'pending'])->default('active');
                $table->boolean('wa_verified')->default(false);
                $table->string('wa_verification_code')->nullable();
                $table->timestamp('wa_verified_at')->nullable();
                $table->text('alamat')->nullable();
                $table->string('foto_profil')->nullable();
                $table->rememberToken();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
