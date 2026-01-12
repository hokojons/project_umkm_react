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
        Schema::create('product_rejection_reasons', function (Blueprint $table) {
            $table->id();
            $table->string('kodeproduk', 15)->index();
            $table->text('reason');
            $table->string('rejected_by')->nullable(); // admin who rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_rejection_reasons');
    }
};
