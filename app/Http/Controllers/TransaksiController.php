<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Pelanggan;
use App\Models\Tarif;
use App\Models\Transaksi;

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
        $pelanggans = Pelanggan::orderBy('nama')->get(['id', 'nama', 'no_hp']);
        $tarifs = Tarif::where('aktif', true)->orderBy('nama')->get([
            'id',
            'nama',
            'harga_per_kilo',
        ]);

        return Inertia::render('Transaksi/Create', [
            'pelanggans' => $pelanggans,
            'tarifs' => $tarifs,
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

        $validated['status'] = $validated['status'] ?? 'proses';

        Transaksi::create($validated);

        return redirect()
            ->route('transaksi.index')
            ->with('message', 'Transaksi berhasil ditambahkan');
    }

    public function edit(Transaksi $transaksi)
    {
        $transaksi->load('pelanggan');
        $pelanggans = Pelanggan::orderBy('nama')->get(['id', 'nama', 'no_hp']);
        $tarifs = Tarif::where('aktif', true)->orderBy('nama')->get([
            'id',
            'nama',
            'harga_per_kilo',
        ]);

        return Inertia::render('Transaksi/Edit', [
            'transaksi' => $transaksi,
            'pelanggans' => $pelanggans,
            'tarifs' => $tarifs,
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

        $transaksi->update([
            'status' => $validated['status'],
        ]);

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
