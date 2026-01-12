<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Migration already applied manually - skip to avoid errors
        // tpengguna table already restructured for event registration
    }

    public function down()
    {
        // No action needed
    }
};
