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
        Schema::table('transaksis', function (Blueprint $table) {
            $table->decimal('subtotal_harga', 12, 2)->unsigned()->nullable()->after('harga_per_kilo');
            $table->decimal('diskon_persen', 5, 2)->unsigned()->default(0)->after('subtotal_harga');
            $table->decimal('diskon_nominal', 12, 2)->unsigned()->default(0)->after('diskon_persen');
            $table->date('estimasi_selesai')->nullable()->after('status');
            $table->timestamp('selesai_at')->nullable()->after('estimasi_selesai');
            $table->timestamp('diambil_at')->nullable()->after('selesai_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaksis', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal_harga',
                'diskon_persen',
                'diskon_nominal',
                'estimasi_selesai',
                'selesai_at',
                'diambil_at',
            ]);
        });
    }
};
