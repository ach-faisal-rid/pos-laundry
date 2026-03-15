<?php

namespace App\Http\Controllers;

use App\Models\Tarif;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TarifController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'q' => ['nullable', 'string', 'max:100'],
            'aktif' => ['nullable', 'string', 'in:all,aktif,nonaktif'],
        ]);

        $q = trim((string) ($validated['q'] ?? ''));
        $aktif = (string) ($validated['aktif'] ?? 'all');
        if ($aktif === '') {
            $aktif = 'all';
        }

        $tarifs = Tarif::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where('nama', 'like', '%' . $q . '%');
            })
            ->when($aktif === 'aktif', function ($query) {
                $query->where('aktif', true);
            })
            ->when($aktif === 'nonaktif', function ($query) {
                $query->where('aktif', false);
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Tarif/Index', [
            'tarifs' => $tarifs,
            'filters' => [
                'q' => $q,
                'aktif' => $aktif,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Tarif/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100', 'unique:tarifs,nama'],
            'harga_per_kilo' => ['required', 'numeric', 'min:0'],
            'aktif' => ['required', 'boolean'],
        ]);

        Tarif::create($validated);

        return redirect()
            ->route('tarif.index')
            ->with('message', 'Tarif berhasil ditambahkan');
    }

    public function edit(Tarif $tarif)
    {
        return Inertia::render('Tarif/Edit', [
            'tarif' => $tarif,
        ]);
    }

    public function update(Request $request, Tarif $tarif)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100', "unique:tarifs,nama,{$tarif->id}"],
            'harga_per_kilo' => ['required', 'numeric', 'min:0'],
            'aktif' => ['required', 'boolean'],
        ]);

        $tarif->update($validated);

        return redirect()
            ->route('tarif.index')
            ->with('message', 'Tarif berhasil diupdate');
    }

    public function destroy(Tarif $tarif)
    {
        $tarif->delete();

        return redirect()
            ->route('tarif.index')
            ->with('message', 'Tarif berhasil dihapus');
    }
}
