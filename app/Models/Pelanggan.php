<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Pelanggan extends Model
{
    protected $table = 'pelanggans';

    protected $fillable = [
        'nama',
        'kode',
        'no_hp',
        'alamat',
    ];

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($pelanggan) {
            if (!empty($pelanggan->kode)) {
                return;
            }

            do {
                $kode = Str::upper(Str::random(8));
            } while (self::where('kode', $kode)->exists());

            $pelanggan->kode = $kode;
        });
    }
}
