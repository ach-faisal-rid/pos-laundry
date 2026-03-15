<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pelanggan extends Model
{
    protected $table = 'pelanggans';

    protected $fillable = [
        'nama',
        'no_hp',
        'alamat',
    ];

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class);
    }
}
