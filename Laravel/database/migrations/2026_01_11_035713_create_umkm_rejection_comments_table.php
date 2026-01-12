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
        if (!Schema::hasTable('umkm_rejection_comments')) {
            Schema::create('umkm_rejection_comments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('umkm_id');
                $table->text('comment');
                $table->unsignedBigInteger('admin_id')->nullable();
                $table->timestamps();
                
                $table->foreign('umkm_id')->references('id')->on('tumkm')->onDelete('cascade');
                $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('umkm_rejection_comments');
    }
};
