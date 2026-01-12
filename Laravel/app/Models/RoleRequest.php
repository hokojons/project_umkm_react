<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoleRequest extends Model
{
    protected $table = 'role_upgrade_requests';
    
    protected $fillable = [
        'user_id',
        'nama_pemilik',
        'nama_toko',
        'alamat_toko',
        'kategori_id',
        'status_pengajuan',
        'alasan_pengajuan',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the user who made the request
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin who reviewed the request
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
