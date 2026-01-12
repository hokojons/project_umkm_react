<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $primaryKey = 'user_id';
    protected $table = 'businesses';

    protected $fillable = [
        'user_id',
        'nama_pemilik',
        'nama_bisnis',
        'alamat',
        'alasan_pengajuan',
        'category_id',
        'no_whatsapp',
        'status_verifikasi_wa',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'user_id', 'user_id');
    }
}
