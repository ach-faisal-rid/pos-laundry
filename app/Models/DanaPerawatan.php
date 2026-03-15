<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DanaPerawatan extends Model
{
    protected $fillable = ['keterangan', 'jumlah', 'tanggal', 'jenis'];

    protected $casts = [
        'tanggal' => 'date',
    ];
}
