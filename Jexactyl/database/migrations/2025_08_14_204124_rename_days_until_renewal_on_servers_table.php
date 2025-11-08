<?php

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->date('renewal_date')->nullable()->after('days_until_renewal');
        });

        DB::table('servers')
            ->select('id', 'days_until_renewal')
            ->orderBy('id')
            ->chunk(100, function ($servers) {
                foreach ($servers as $server) {
                    if (!is_null($server->days_until_renewal)) {
                        $renewalDate = Carbon::today()->addDays($server->days_until_renewal);
                        DB::table('servers')
                            ->where('id', $server->id)
                            ->update(['renewal_date' => $renewalDate]);
                    }
                }
            });

        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn('days_until_renewal');
        });
    }

    public function down(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->integer('days_until_renewal')->nullable()->after('renewal_date');
        });

        DB::table('servers')
            ->select('id', 'renewal_date')
            ->orderBy('id')
            ->chunk(100, function ($servers) {
                foreach ($servers as $server) {
                    if (!is_null($server->renewal_date)) {
                        $days = Carbon::today()->diffInDays(Carbon::parse($server->renewal_date), false);
                        DB::table('servers')
                            ->where('id', $server->id)
                            ->update(['days_until_renewal' => $days]);
                    }
                }
            });

        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn('renewal_date');
        });
    }
};
