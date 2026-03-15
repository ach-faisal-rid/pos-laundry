<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyTier extends Model
{
    protected $fillable = [
        'kode',
        'nama',
        'min_transaksi',
        'diskon_persen',
        'aktif',
    ];

    protected $casts = [
        'aktif' => 'boolean',
    ];
}
