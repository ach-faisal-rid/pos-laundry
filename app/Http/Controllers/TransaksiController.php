<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Pelanggan;
use App\Models\Tarif;
use App\Models\Transaksi;
use App\Models\LoyaltyTier;
use Carbon\Carbon;

class TransaksiController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:all,proses,selesai,diambil'],
        ]);

        $q = trim((string) ($validated['q'] ?? ''));
        $status = (string) ($validated['status'] ?? 'all');
        if ($status === '') {
            $status = 'all';
        }

        $transaksis = Transaksi::query()
            ->with('pelanggan')
            ->when($q !== '', function ($query) use ($q) {
                $query->whereHas('pelanggan', function ($subQuery) use ($q) {
                    $subQuery
                        ->where('nama', 'like', '%' . $q . '%')
                        ->orWhere('no_hp', 'like', '%' . $q . '%');
                });
            })
            ->when($status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->latest('tanggal')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Transaksi/Index', [
            'transaksis' => $transaksis,
            'filters' => [
                'q' => $q,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        $pelanggans = Pelanggan::orderBy('nama')
            ->withCount('transaksis')
            ->get(['id', 'nama', 'no_hp', 'kode']);
        $tarifs = Tarif::where('aktif', true)->orderBy('nama')->get([
            'id',
            'nama',
            'harga_per_kilo',
        ]);
        $tiers = LoyaltyTier::where('aktif', true)
            ->orderBy('min_transaksi')
            ->get(['id', 'kode', 'nama', 'min_transaksi', 'diskon_persen']);

        return Inertia::render('Transaksi/Create', [
            'pelanggans' => $pelanggans,
            'tarifs' => $tarifs,
            'tiers' => $tiers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pelanggan_id' => ['required', 'exists:pelanggans,id'],
            'tarif_id' => ['nullable', 'exists:tarifs,id'],
            'tanggal' => ['required', 'date'],
            'berat' => ['required', 'numeric', 'min:0.01'],
            'harga_per_kilo' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:proses,selesai,diambil'],
            'catatan' => ['nullable', 'string'],
        ]);

        $pelanggan = Pelanggan::withCount('transaksis')->find($validated['pelanggan_id']);
        $tiers = LoyaltyTier::where('aktif', true)
            ->orderBy('min_transaksi')
            ->get();

        $diskonPersen = 0;
        if ($pelanggan) {
            $count = $pelanggan->transaksis_count;
            $tier = $tiers
                ->filter(fn ($item) => $count >= $item->min_transaksi)
                ->last();
            if ($tier) {
                $diskonPersen = (float) $tier->diskon_persen;
            }
        }

        $tanggal = Carbon::parse($validated['tanggal']);
        $avgDays = Transaksi::where('pelanggan_id', $validated['pelanggan_id'])
            ->whereNotNull('diambil_at')
            ->get()
            ->map(fn ($trx) => $trx->tanggal->diffInDays($trx->diambil_at))
            ->average();
        $avgDays = $avgDays ? max(2, (int) round($avgDays)) : 2;

        $validated['diskon_persen'] = $diskonPersen;
        $validated['estimasi_selesai'] = $tanggal->copy()->addDays($avgDays);
        $validated['status'] = $validated['status'] ?? 'proses';

        Transaksi::create($validated);

        return redirect()
            ->route('transaksi.index')
            ->with('message', 'Transaksi berhasil ditambahkan');
    }

    public function edit(Transaksi $transaksi)
    {
        $transaksi->load('pelanggan');
        $pelanggans = Pelanggan::orderBy('nama')
            ->withCount('transaksis')
            ->get(['id', 'nama', 'no_hp', 'kode']);
        $tarifs = Tarif::where('aktif', true)->orderBy('nama')->get([
            'id',
            'nama',
            'harga_per_kilo',
        ]);
        $tiers = LoyaltyTier::where('aktif', true)
            ->orderBy('min_transaksi')
            ->get(['id', 'kode', 'nama', 'min_transaksi', 'diskon_persen']);

        return Inertia::render('Transaksi/Edit', [
            'transaksi' => $transaksi,
            'pelanggans' => $pelanggans,
            'tarifs' => $tarifs,
            'tiers' => $tiers,
        ]);
    }

    public function update(Request $request, Transaksi $transaksi)
    {
        $validated = $request->validate([
            'pelanggan_id' => ['required', 'exists:pelanggans,id'],
            'tarif_id' => ['nullable', 'exists:tarifs,id'],
            'tanggal' => ['required', 'date'],
            'berat' => ['required', 'numeric', 'min:0.01'],
            'harga_per_kilo' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:proses,selesai,diambil'],
            'catatan' => ['nullable', 'string'],
        ]);

        $pelanggan = Pelanggan::withCount('transaksis')->find($validated['pelanggan_id']);
        $tiers = LoyaltyTier::where('aktif', true)
            ->orderBy('min_transaksi')
            ->get();
        $diskonPersen = 0;
        if ($pelanggan) {
            $count = $pelanggan->transaksis_count;
            $tier = $tiers
                ->filter(fn ($item) => $count >= $item->min_transaksi)
                ->last();
            if ($tier) {
                $diskonPersen = (float) $tier->diskon_persen;
            }
        }

        $tanggal = Carbon::parse($validated['tanggal']);
        $avgDays = Transaksi::where('pelanggan_id', $validated['pelanggan_id'])
            ->whereNotNull('diambil_at')
            ->get()
            ->map(fn ($trx) => $trx->tanggal->diffInDays($trx->diambil_at))
            ->average();
        $avgDays = $avgDays ? max(2, (int) round($avgDays)) : 2;

        $validated['diskon_persen'] = $diskonPersen;
        $validated['estimasi_selesai'] = $tanggal->copy()->addDays($avgDays);
        $transaksi->update($validated);

        return redirect()
            ->route('transaksi.index')
            ->with('message', 'Transaksi berhasil diupdate');
    }

    public function updateStatus(Request $request, Transaksi $transaksi)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:proses,selesai,diambil'],
        ]);

        $data = ['status' => $validated['status']];
        if ($validated['status'] === 'selesai' && !$transaksi->selesai_at) {
            $data['selesai_at'] = Carbon::now();
        }
        if ($validated['status'] === 'diambil' && !$transaksi->diambil_at) {
            $data['diambil_at'] = Carbon::now();
            if (!$transaksi->selesai_at) {
                $data['selesai_at'] = Carbon::now();
            }
        }

        $transaksi->update($data);

        return redirect()
            ->route('transaksi.index')
            ->with('message', 'Status transaksi berhasil diupdate');
    }

    public function destroy(Transaksi $transaksi)
    {
        $transaksi->delete();

        return redirect()
            ->route('transaksi.index')
            ->with('message', 'Transaksi berhasil dihapus');
    }
}
