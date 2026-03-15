<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pelanggans', function (Blueprint $table) {
            $table->string('kode', 16)->nullable()->unique()->after('id');
        });

        $existing = DB::table('pelanggans')->pluck('kode', 'id');
        $used = $existing->filter()->flip()->toArray();

        foreach ($existing as $id => $kode) {
            if ($kode) {
                continue;
            }

            do {
                $newKode = Str::upper(Str::random(8));
            } while (isset($used[$newKode]));

            DB::table('pelanggans')->where('id', $id)->update([
                'kode' => $newKode,
            ]);
            $used[$newKode] = true;
        }

        // Keep nullable to avoid DBAL dependency for change() in some environments.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pelanggans', function (Blueprint $table) {
            $table->dropUnique(['kode']);
            $table->dropColumn('kode');
        });
    }
};
