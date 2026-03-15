<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    protected $fillable = [
        'pelanggan_id',
        'tarif_id',
        'tanggal',
        'berat',
        'harga_per_kilo',
        'total_harga',
        'status',
        'catatan'
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class);
    }

    public function tarif()
    {
        return $this->belongsTo(Tarif::class);
    }

    // Auto calculate total_harga
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaksi) {
            $transaksi->total_harga = $transaksi->berat * $transaksi->harga_per_kilo;
        });

        static::updating(function ($transaksi) {
            $transaksi->total_harga = $transaksi->berat * $transaksi->harga_per_kilo;
        });
    }
}
