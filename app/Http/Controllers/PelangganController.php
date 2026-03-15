<?php

namespace App\Http\Controllers;

use App\Models\Pelanggan;
use Inertia\Inertia;
use App\Http\Requests\StorePelangganRequest;
use App\Http\Requests\UpdatePelangganRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;

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
        return Inertia::render('Pelanggan/Edit', [
            'pelanggan' => $pelanggan
        ]);
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

            $rows[] = [
                'nama' => $nama,
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
