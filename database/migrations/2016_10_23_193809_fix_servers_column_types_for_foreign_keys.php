<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * These columns were renamed to their `_id` suffixed counterparts by the
     * 2017_02_02_175548_UpdateColumnNames migration. On installs that already
     * ran that migration the old column names no longer exist, so guard each
     * statement rather than assuming a fresh, never-migrated schema.
     */
    public function up(): void
    {
        if (Schema::hasColumn('servers', 'node')) {
            DB::statement('ALTER TABLE servers MODIFY node INT UNSIGNED');
        }
        if (Schema::hasColumn('servers', 'owner')) {
            DB::statement('ALTER TABLE servers MODIFY owner INT UNSIGNED');
        }
        if (Schema::hasColumn('servers', 'allocation')) {
            DB::statement('ALTER TABLE servers MODIFY allocation INT UNSIGNED');
        }
        if (Schema::hasColumn('servers', 'service')) {
            DB::statement('ALTER TABLE servers MODIFY service INT UNSIGNED');
        }
        if (Schema::hasColumn('servers', 'option')) {
            DB::statement('ALTER TABLE servers MODIFY `option` INT UNSIGNED');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('servers', 'node')) {
            DB::statement('ALTER TABLE servers MODIFY node INT');
        }
        if (Schema::hasColumn('servers', 'owner')) {
            DB::statement('ALTER TABLE servers MODIFY owner INT');
        }
        if (Schema::hasColumn('servers', 'allocation')) {
            DB::statement('ALTER TABLE servers MODIFY allocation INT');
        }
        if (Schema::hasColumn('servers', 'service')) {
            DB::statement('ALTER TABLE servers MODIFY service INT');
        }
        if (Schema::hasColumn('servers', 'option')) {
            DB::statement('ALTER TABLE servers MODIFY `option` INT');
        }
    }
};
