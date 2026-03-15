<?php

namespace App\Http\Controllers;

use App\Models\DanaPerawatan;
use App\Models\Transaksi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        $pendapatanHariIni = Transaksi::whereDate('tanggal', $today)
            ->sum('total_harga');

        $countProses = Transaksi::where('status', 'proses')->count();
        $countSelesai = Transaksi::where('status', 'selesai')->count();
        $countDiambil = Transaksi::where('status', 'diambil')->count();

        $danaSaldo = DanaPerawatan::query()
            ->selectRaw(
                "SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE -jumlah END) as saldo",
            )
            ->value('saldo') ?? 0;

        $recentTransaksis = Transaksi::with('pelanggan')
            ->latest()
            ->limit(6)
            ->get()
            ->map(function ($transaksi) {
                return [
                    'id' => $transaksi->id,
                    'tanggal' => $transaksi->tanggal,
                    'status' => $transaksi->status,
                    'total_harga' => $transaksi->total_harga,
                    'pelanggan' => [
                        'nama' => $transaksi->pelanggan?->nama,
                        'no_hp' => $transaksi->pelanggan?->no_hp,
                    ],
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'pendapatan_hari_ini' => $pendapatanHariIni,
                'status' => [
                    'proses' => $countProses,
                    'selesai' => $countSelesai,
                    'diambil' => $countDiambil,
                ],
                'dana_saldo' => $danaSaldo,
            ],
            'recent' => $recentTransaksis,
        ]);
    }
}
