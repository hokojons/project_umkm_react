<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table already exists - skip to avoid errors
        if (!Schema::hasTable('role_upgrade_requests')) {
            Schema::create('role_upgrade_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('current_role', 20)->default('customer');
                $table->string('requested_role', 20)->default('umkm_owner');
                $table->text('reason')->nullable();
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->timestamp('submitted_at')->useCurrent();
                $table->timestamp('reviewed_at')->nullable();
                $table->foreignId('reviewed_by')->nullable()->constrained('users');
                $table->text('rejection_reason')->nullable();
                $table->timestamps();
                
                // Index for faster queries
                $table->index(['user_id', 'status']);
                $table->index('status');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('role_upgrade_requests');
    }
};
