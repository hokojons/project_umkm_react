<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $primaryKey = 'id';
    protected $table = 'categories';

    protected $fillable = [
        'id',
        'nama',
        'status'
    ];

    public function businesses()
    {
        return $this->hasMany(Business::class, 'category_id', 'id');
    }
}
