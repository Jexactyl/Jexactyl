<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('servers')
            ->where('renewal_date', '0000-00-00')
            ->update(['renewal_date' => null]);

        Schema::table('servers', function (Blueprint $table) {
            $table->date('renewal_date')->nullable()->change();
        });
    }
};
