<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * BusinessSubmission Model
 * Represents UMKM business/store submissions in tumkm table
 * NOT for role upgrade requests
 */
class BusinessSubmission extends Model
{
    protected $table = 'tumkm';
    protected $primaryKey = 'kodepengguna';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kodepengguna',
        'namapemilik',
        'namatoko',
        'alamattoko',
        'kodekategori',
        'statuspengajuan',
        'alasan_pengajuan'
    ];

    // Accessor/Mutator untuk mapping ke nama yang diharapkan controller
    public function getUserIdAttribute()
    {
        return $this->kodepengguna;
    }

    public function setUserIdAttribute($value)
    {
        $this->attributes['kodepengguna'] = $value;
    }

    public function getNamaPemilikAttribute($value)
    {
        return $value ?? $this->attributes['namapemilik'] ?? null;
    }

    public function setNamaPemilikAttribute($value)
    {
        $this->attributes['namapemilik'] = $value;
    }

    public function getNamaTokoAttribute($value)
    {
        return $value ?? $this->attributes['namatoko'] ?? null;
    }

    public function setNamaTokoAttribute($value)
    {
        $this->attributes['namatoko'] = $value;
    }

    public function getAlamatTokoAttribute($value)
    {
        return $value ?? $this->attributes['alamattoko'] ?? null;
    }

    public function setAlamatTokoAttribute($value)
    {
        $this->attributes['alamattoko'] = $value;
    }

    public function getKategoriIdAttribute()
    {
        return $this->kodekategori;
    }

    public function setKategoriIdAttribute($value)
    {
        $this->attributes['kodekategori'] = $value;
    }

    public function getStatusPengajuanAttribute($value)
    {
        return $value ?? $this->attributes['statuspengajuan'] ?? null;
    }

    public function setStatusPengajuanAttribute($value)
    {
        $this->attributes['statuspengajuan'] = $value;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'kodepengguna', 'id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'kodekategori', 'id');
    }
}
