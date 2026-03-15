<?php

namespace App\Http\Controllers;

use App\Models\Pelanggan;
use Inertia\Inertia;
use App\Http\Requests\StorePelangganRequest;
use App\Http\Requests\UpdatePelangganRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PelangganController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'q' => ['nullable', 'string', 'max:100'],
            'filter' => ['nullable', 'string', 'in:all,alamat,tanpa_alamat'],
        ]);

        $q = trim((string) ($validated['q'] ?? ''));
        $filter = (string) ($validated['filter'] ?? 'all');
        if ($filter === '') {
            $filter = 'all';
        }

        $pelanggans = Pelanggan::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery
                        ->where('nama', 'like', '%' . $q . '%')
                        ->orWhere('no_hp', 'like', '%' . $q . '%');
                });
            })
            ->when($filter === 'alamat', function ($query) {
                $query
                    ->whereNotNull('alamat')
                    ->where('alamat', '!=', '');
            })
            ->when($filter === 'tanpa_alamat', function ($query) {
                $query->where(function ($subQuery) {
                    $subQuery->whereNull('alamat')->orWhere('alamat', '');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
        
        return Inertia::render('Pelanggan/Index', [
            'pelanggans' => $pelanggans,
            'filters' => [
                'q' => $q,
                'filter' => $filter,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Pelanggan/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePelangganRequest $request)
    {
        $validated = $request->validated();

        Pelanggan::create($validated);

        return redirect()->route('pelanggan.index')
            ->with('message', 'Pelanggan berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Pelanggan $pelanggan)
    {
        return Inertia::render('Pelanggan/Show', [
            'pelanggan' => $pelanggan
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pelanggan $pelanggan)
    {
        $insights = $this->buildInsights($pelanggan);

        return Inertia::render('Pelanggan/Edit', [
            'pelanggan' => $pelanggan,
            'history' => $insights['history'],
            'recommendations' => $insights['recommendations'],
        ]);
    }

    public function generateKode(Pelanggan $pelanggan)
    {
        if (!$pelanggan->kode) {
            do {
                $kode = Str::upper(Str::random(8));
            } while (Pelanggan::where('kode', $kode)->exists());

            $pelanggan->update([
                'kode' => $kode,
            ]);
        }

        return redirect()
            ->route('pelanggan.edit', $pelanggan->id)
            ->with('message', 'QR code pelanggan sudah disediakan.');
    }

    public function lookupByCode(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:16'],
        ]);

        $pelanggan = Pelanggan::where('kode', $validated['code'])
            ->first();

        if (!$pelanggan) {
            return response()->json([
                'found' => false,
                'message' => 'Pelanggan tidak ditemukan.',
            ], 404);
        }

        $insights = $this->buildInsights($pelanggan);

        return response()->json([
            'found' => true,
            'pelanggan' => [
                'id' => $pelanggan->id,
                'nama' => $pelanggan->nama,
                'no_hp' => $pelanggan->no_hp,
                'kode' => $pelanggan->kode,
            ],
            'recent' => $insights['history'],
            'recommendations' => $insights['recommendations'],
        ]);
    }

    public function publicStatus(string $kode)
    {
        $pelanggan = Pelanggan::where('kode', $kode)->first();

        if (!$pelanggan) {
            return Inertia::render('Public/LaundryStatus', [
                'found' => false,
            ]);
        }

        $recent = $pelanggan->transaksis()
            ->latest('tanggal')
            ->latest()
            ->limit(3)
            ->get(['id', 'tanggal', 'status', 'total_harga']);

        $masked = $pelanggan->no_hp
            ? substr($pelanggan->no_hp, 0, 4) . str_repeat('*', max(0, strlen($pelanggan->no_hp) - 7)) . substr($pelanggan->no_hp, -3)
            : '-';

        return Inertia::render('Public/LaundryStatus', [
            'found' => true,
            'pelanggan' => [
                'nama' => $pelanggan->nama,
                'no_hp' => $masked,
                'kode' => $pelanggan->kode,
            ],
            'recent' => $recent,
        ]);
    }

    private function buildInsights(Pelanggan $pelanggan): array
    {
        $history = $pelanggan->transaksis()
            ->with('tarif')
            ->latest('tanggal')
            ->latest()
            ->limit(6)
            ->get()
            ->map(function ($transaksi) {
                return [
                    'id' => $transaksi->id,
                    'tanggal' => $transaksi->tanggal,
                    'status' => $transaksi->status,
                    'total_harga' => $transaksi->total_harga,
                    'tarif' => $transaksi->tarif
                        ? [
                            'id' => $transaksi->tarif->id,
                            'nama' => $transaksi->tarif->nama,
                            'harga_per_kilo' => $transaksi->tarif->harga_per_kilo,
                        ]
                        : null,
                ];
            });

        $totalTransaksi = $pelanggan->transaksis()->count();
        $mostUsedTarif = $pelanggan->transaksis()
            ->with('tarif')
            ->get()
            ->groupBy('tarif_id')
            ->sortByDesc(function ($group) {
                return $group->count();
            })
            ->first();

        $recommendTarif = null;
        if ($mostUsedTarif && $mostUsedTarif->first()?->tarif) {
            $recommendTarif = $mostUsedTarif->first()->tarif->nama;
        }

        $lastTwo = $pelanggan->transaksis()
            ->latest('tanggal')
            ->limit(2)
            ->get();
        $nextEstimate = null;
        if ($lastTwo->count() === 2) {
            $diff = $lastTwo[1]->tanggal->diffInDays($lastTwo[0]->tanggal);
            $avg = max(3, min(21, $diff));
            $nextEstimate = $lastTwo[0]->tanggal->copy()->addDays($avg);
        }

        $discount = null;
        if ($totalTransaksi >= 10) {
            $discount = 10;
        } elseif ($totalTransaksi >= 5) {
            $discount = 5;
        }

        $recommendations = [
            'tarif' => $recommendTarif
                ? "Disarankan layanan: {$recommendTarif}."
                : 'Belum ada rekomendasi layanan.',
            'jadwal' => $nextEstimate
                ? 'Perkiraan jadwal berikutnya: ' . $nextEstimate->toDateString() . '.'
                : 'Belum cukup data untuk estimasi jadwal.',
            'harga' => $discount
                ? "Rekomendasi harga: diskon {$discount}% untuk pelanggan loyal."
                : 'Rekomendasi harga: harga normal.',
            'stat' => [
                'total_transaksi' => $totalTransaksi,
            ],
        ];

        return [
            'history' => $history,
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePelangganRequest $request, Pelanggan $pelanggan)
    {
        $validated = $request->validated();

        $pelanggan->update($validated);

        return redirect()->route('pelanggan.index')
            ->with('message', 'Pelanggan berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pelanggan $pelanggan)
    {
        $pelanggan->delete();

        return redirect()->route('pelanggan.index')
            ->with('message', 'Pelanggan berhasil dihapus');
    }

    public function template()
    {
        $header = ['nama', 'no_hp', 'alamat'];
        $rows = [
            ['Contoh Pelanggan', '08537182716', 'Jalan Mawar No 1'],
        ];

        $content = implode(',', $header) . "\n";
        foreach ($rows as $row) {
            $content .= implode(',', array_map(function ($value) {
                $escaped = str_replace('"', '""', $value);
                return '"' . $escaped . '"';
            }, $row)) . "\n";
        }

        return response()->streamDownload(function () use ($content) {
            echo $content;
        }, 'template-pelanggan.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) {
            return redirect()
                ->route('pelanggan.index')
                ->with('message', 'Gagal membaca file CSV.');
        }

        $firstLine = fgets($handle);
        if ($firstLine === false) {
            fclose($handle);
            return redirect()
                ->route('pelanggan.index')
                ->with('message', 'Header CSV tidak ditemukan.');
        }

        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',')
            ? ';'
            : ',';

        $header = str_getcsv($firstLine, $delimiter);
        if (!$header) {
            fclose($handle);
            return redirect()
                ->route('pelanggan.index')
                ->with('message', 'Header CSV tidak ditemukan.');
        }

        $normalizedHeader = array_map(function ($value) {
            $value = trim($value);
            $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
            return strtolower($value);
        }, $header);

        $required = ['nama', 'no_hp', 'alamat'];
        foreach ($required as $column) {
            if (!in_array($column, $normalizedHeader, true)) {
                fclose($handle);
                return redirect()
                    ->route('pelanggan.index')
                    ->with('message', 'Kolom wajib belum lengkap: nama, no_hp, alamat.');
            }
        }

        $indexMap = array_flip($normalizedHeader);
        $now = Carbon::now();
        $rows = [];
        $total = 0;
        $inserted = 0;
        $skippedExisting = 0;
        $skippedInvalid = 0;
        $seenNoHp = [];
        $seenKode = Pelanggan::pluck('kode')->filter()->flip()->toArray();

        while (($line = fgets($handle)) !== false) {
            $data = str_getcsv($line, $delimiter);
            $total++;

            $nama = trim($data[$indexMap['nama']] ?? '');
            $noHpRaw = trim($data[$indexMap['no_hp']] ?? '');
            $alamat = trim($data[$indexMap['alamat']] ?? '');

            if ($nama === '' && $noHpRaw === '' && $alamat === '') {
                $skippedInvalid++;
                continue;
            }

            $noHp = preg_replace('/\D+/', '', $noHpRaw);
            if (str_starts_with($noHp, '62')) {
                $noHp = '0' . substr($noHp, 2);
            }

            $validator = Validator::make(
                [
                    'nama' => $nama,
                    'no_hp' => $noHp,
                    'alamat' => $alamat,
                ],
                [
                    'nama' => ['required', 'string', 'max:255'],
                    'no_hp' => ['required', 'string', 'min:11', 'max:14', 'regex:/^[0-9]+$/'],
                    'alamat' => ['required', 'string'],
                ],
            );

            if ($validator->fails()) {
                $skippedInvalid++;
                continue;
            }

            if (isset($seenNoHp[$noHp])) {
                $skippedExisting++;
                continue;
            }

            if (Pelanggan::where('no_hp', $noHp)->exists()) {
                $skippedExisting++;
                continue;
            }

            do {
                $kode = Str::upper(Str::random(8));
            } while (isset($seenKode[$kode]));
            $seenKode[$kode] = true;

            $rows[] = [
                'nama' => $nama,
                'kode' => $kode,
                'no_hp' => $noHp,
                'alamat' => $alamat,
                'created_at' => $now,
                'updated_at' => $now,
            ];
            $seenNoHp[$noHp] = true;
        }

        fclose($handle);

        if (!empty($rows)) {
            Pelanggan::insert($rows);
            $inserted = count($rows);
        }

        return redirect()
            ->route('pelanggan.index')
            ->with(
                'message',
                "Import selesai: total {$total}, berhasil {$inserted}, skip existing {$skippedExisting}, invalid {$skippedInvalid}.",
            );
    }
}
