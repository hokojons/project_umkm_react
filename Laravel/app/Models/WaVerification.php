<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaVerification extends Model
{
    protected $table = 'wa_verifications';

    protected $fillable = [
        'phone_number',
        'code',
        'type',
        'is_verified',
        'verified_at',
        'expires_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
}
