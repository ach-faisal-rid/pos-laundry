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
        'subtotal_harga',
        'diskon_persen',
        'diskon_nominal',
        'total_harga',
        'status',
        'estimasi_selesai',
        'selesai_at',
        'diambil_at',
        'catatan'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'estimasi_selesai' => 'date',
        'selesai_at' => 'datetime',
        'diambil_at' => 'datetime',
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
            $transaksi->subtotal_harga = $transaksi->berat * $transaksi->harga_per_kilo;
            $diskonPersen = (float) ($transaksi->diskon_persen ?? 0);
            $transaksi->diskon_nominal = $transaksi->subtotal_harga * ($diskonPersen / 100);
            $transaksi->total_harga = $transaksi->subtotal_harga - $transaksi->diskon_nominal;
        });

        static::updating(function ($transaksi) {
            $transaksi->subtotal_harga = $transaksi->berat * $transaksi->harga_per_kilo;
            $diskonPersen = (float) ($transaksi->diskon_persen ?? 0);
            $transaksi->diskon_nominal = $transaksi->subtotal_harga * ($diskonPersen / 100);
            $transaksi->total_harga = $transaksi->subtotal_harga - $transaksi->diskon_nominal;
        });
    }
}
