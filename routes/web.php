<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\DanaPerawatanController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/pelanggan/template', [PelangganController::class, 'template'])
        ->name('pelanggan.template');
    Route::post('/pelanggan/import', [PelangganController::class, 'import'])
        ->name('pelanggan.import');
    Route::get('/pelanggan', [PelangganController::class, 'index'])
        ->middleware('throttle:pelanggan-index')
        ->name('pelanggan.index');
    Route::resource('pelanggan', PelangganController::class)
        ->except(['show', 'index']);

    Route::patch('/transaksi/{transaksi}/status', [TransaksiController::class, 'updateStatus'])
        ->name('transaksi.status');
    Route::resource('transaksi', TransaksiController::class)->except(['show']);

    Route::resource('tarif', TarifController::class)->except(['show']);

    Route::resource('dana-perawatan', DanaPerawatanController::class)->except(['show']);
});

require __DIR__.'/auth.php';
