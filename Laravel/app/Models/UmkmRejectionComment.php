<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UmkmRejectionComment extends Model
{
    protected $fillable = [
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
