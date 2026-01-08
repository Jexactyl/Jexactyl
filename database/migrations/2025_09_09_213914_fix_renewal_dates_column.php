<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
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
