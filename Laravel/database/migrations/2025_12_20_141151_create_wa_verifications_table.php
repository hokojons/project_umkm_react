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
        Schema::create('wa_verifications', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number', 20);
            $table->string('code', 6);
            $table->string('type', 20); // 'user' or 'admin'
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index('phone_number');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wa_verifications');
    }
};
