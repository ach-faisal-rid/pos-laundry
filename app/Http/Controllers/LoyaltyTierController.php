<?php

namespace App\Http\Controllers;

use App\Models\LoyaltyTier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoyaltyTierController extends Controller
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

        $tiers = LoyaltyTier::query()
            ->when($q !== '', function ($query) use ($q) {
                $query
                    ->where('nama', 'like', '%' . $q . '%')
                    ->orWhere('kode', 'like', '%' . $q . '%');
            })
            ->when($aktif === 'aktif', function ($query) {
                $query->where('aktif', true);
            })
            ->when($aktif === 'nonaktif', function ($query) {
                $query->where('aktif', false);
            })
            ->orderBy('min_transaksi')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('LoyaltyTier/Index', [
            'tiers' => $tiers,
            'filters' => [
                'q' => $q,
                'aktif' => $aktif,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('LoyaltyTier/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:5', 'unique:loyalty_tiers,kode'],
            'nama' => ['required', 'string', 'max:100'],
            'min_transaksi' => ['required', 'integer', 'min:0'],
            'diskon_persen' => ['required', 'numeric', 'min:0', 'max:100'],
            'aktif' => ['required', 'boolean'],
        ]);

        LoyaltyTier::create($validated);

        return redirect()
            ->route('loyalty-tier.index')
            ->with('message', 'Tingkat diskon berhasil ditambahkan');
    }

    public function edit(LoyaltyTier $loyaltyTier)
    {
        return Inertia::render('LoyaltyTier/Edit', [
            'tier' => $loyaltyTier,
        ]);
    }

    public function update(Request $request, LoyaltyTier $loyaltyTier)
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:5', "unique:loyalty_tiers,kode,{$loyaltyTier->id}"],
            'nama' => ['required', 'string', 'max:100'],
            'min_transaksi' => ['required', 'integer', 'min:0'],
            'diskon_persen' => ['required', 'numeric', 'min:0', 'max:100'],
            'aktif' => ['required', 'boolean'],
        ]);

        $loyaltyTier->update($validated);

        return redirect()
            ->route('loyalty-tier.index')
            ->with('message', 'Tingkat diskon berhasil diupdate');
    }

    public function destroy(LoyaltyTier $loyaltyTier)
    {
        $loyaltyTier->delete();

        return redirect()
            ->route('loyalty-tier.index')
            ->with('message', 'Tingkat diskon berhasil dihapus');
    }
}
