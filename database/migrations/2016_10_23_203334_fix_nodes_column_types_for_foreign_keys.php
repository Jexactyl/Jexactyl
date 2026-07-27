<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * This column was renamed to location_id by 2017_02_03_140948_UpdateNodesTable,
     * and later dropped entirely (along with the whole locations feature) by
     * 2025_04_23_163956_drop_location_id_field_from_nodes_table. Guard against
     * installs that are past either of those points.
     */
    public function up(): void
    {
        if (Schema::hasColumn('nodes', 'location')) {
            DB::statement('ALTER TABLE nodes MODIFY location INT UNSIGNED NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('nodes', 'location')) {
            DB::statement('ALTER TABLE nodes MODIFY location INT NOT NULL');
        }
    }
};
