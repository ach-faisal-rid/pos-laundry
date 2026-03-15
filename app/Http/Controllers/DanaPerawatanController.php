<?php

namespace App\Http\Controllers;

use App\Models\DanaPerawatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DanaPerawatanController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'q' => ['nullable', 'string', 'max:100'],
            'jenis' => ['nullable', 'string', 'in:all,pemasukan,pengeluaran'],
        ]);

        $q = trim((string) ($validated['q'] ?? ''));
        $jenis = (string) ($validated['jenis'] ?? 'all');
        if ($jenis === '') {
            $jenis = 'all';
        }

        $danas = DanaPerawatan::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where('keterangan', 'like', '%' . $q . '%');
            })
            ->when($jenis !== 'all', function ($query) use ($jenis) {
                $query->where('jenis', $jenis);
            })
            ->latest('tanggal')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('DanaPerawatan/Index', [
            'danas' => $danas,
            'filters' => [
                'q' => $q,
                'jenis' => $jenis,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('DanaPerawatan/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'keterangan' => ['nullable', 'string'],
            'jumlah' => ['required', 'numeric', 'min:0'],
            'tanggal' => ['required', 'date'],
            'jenis' => ['required', 'in:pemasukan,pengeluaran'],
        ]);

        DanaPerawatan::create($validated);

        return redirect()
            ->route('dana-perawatan.index')
            ->with('message', 'Dana perawatan berhasil ditambahkan');
    }

    public function edit(DanaPerawatan $danaPerawatan)
    {
        return Inertia::render('DanaPerawatan/Edit', [
            'dana' => $danaPerawatan,
        ]);
    }

    public function update(Request $request, DanaPerawatan $danaPerawatan)
    {
        $validated = $request->validate([
            'keterangan' => ['nullable', 'string'],
            'jumlah' => ['required', 'numeric', 'min:0'],
            'tanggal' => ['required', 'date'],
            'jenis' => ['required', 'in:pemasukan,pengeluaran'],
        ]);

        $danaPerawatan->update($validated);

        return redirect()
            ->route('dana-perawatan.index')
            ->with('message', 'Dana perawatan berhasil diupdate');
    }

    public function destroy(DanaPerawatan $danaPerawatan)
    {
        $danaPerawatan->delete();

        return redirect()
            ->route('dana-perawatan.index')
            ->with('message', 'Dana perawatan berhasil dihapus');
    }
}
