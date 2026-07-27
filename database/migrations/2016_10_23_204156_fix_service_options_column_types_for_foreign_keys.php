<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * The service_options table itself was renamed to eggs, and the column
     * to service_id, by 2017_10_06_214053_ServiceOptionsToEggsConversion and
     * 2017_02_05_164123_AdjustColumnNames. hasColumn() returns false for a
     * table that no longer exists under this name, so this also guards
     * against the whole-table rename.
     */
    public function up(): void
    {
        if (Schema::hasColumn('service_options', 'parent_service')) {
            DB::statement('ALTER TABLE service_options MODIFY parent_service INT UNSIGNED NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('service_options', 'parent_service')) {
            DB::statement('ALTER TABLE service_options MODIFY parent_service INT NOT NULL');
        }
    }
};
