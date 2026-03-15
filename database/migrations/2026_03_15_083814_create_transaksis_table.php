<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaksis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelanggan_id')
                ->constrained('pelanggans')
                ->cascadeOnDelete();
            $table->date('tanggal');
            $table->decimal('berat', 8, 2)->unsigned();
            $table->decimal('harga_per_kilo', 10, 2)->unsigned();
            $table->decimal('total_harga', 12, 2)->unsigned();
            $table->enum('status', ['proses', 'selesai', 'diambil'])->default('proses');
            $table->longText('catatan')->nullable();
            $table->timestamps();

            $table->index('tanggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};
