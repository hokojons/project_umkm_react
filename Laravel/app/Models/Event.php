<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'nama',
        'deskripsi',
        'tanggal',
        'kuota',
        'tanggal_pendaftaran'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'tanggal_pendaftaran' => 'date'
    ];

    public function participants()
    {
        return $this->hasMany(EventParticipant::class, 'event_id', 'id');
    }
}
