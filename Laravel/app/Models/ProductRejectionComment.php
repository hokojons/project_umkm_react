<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductRejectionComment extends Model
{
    protected $fillable = [
        'kodeproduk',
        'kodepengguna',
        'comment',
        'status',
        'admin_id'
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
}
