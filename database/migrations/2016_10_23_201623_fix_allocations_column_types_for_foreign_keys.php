<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * These columns were renamed to server_id/node_id by the
     * 2017_02_03_155554_RenameColumns migration. Guard against installs
     * that already ran that rename and no longer have the old names.
     */
    public function up(): void
    {
        if (Schema::hasColumn('allocations', 'assigned_to')) {
            DB::statement('ALTER TABLE allocations MODIFY assigned_to INT UNSIGNED NULL');
        }
        if (Schema::hasColumn('allocations', 'node')) {
            DB::statement('ALTER TABLE allocations MODIFY node INT UNSIGNED NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('allocations', 'assigned_to')) {
            DB::statement('ALTER TABLE allocations MODIFY assigned_to INT NULL');
        }
        if (Schema::hasColumn('allocations', 'node')) {
            DB::statement('ALTER TABLE allocations MODIFY node INT NOT NULL');
        }
    }
};
