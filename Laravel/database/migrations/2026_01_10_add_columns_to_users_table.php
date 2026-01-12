<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Columns already exist - skip to avoid errors
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // No action needed
        });
    }
};
