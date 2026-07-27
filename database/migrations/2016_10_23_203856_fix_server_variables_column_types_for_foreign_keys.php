<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasColumn('server_variables', 'server_id')) {
            DB::statement('ALTER TABLE server_variables MODIFY server_id INT UNSIGNED NULL');
        }
        if (Schema::hasColumn('server_variables', 'variable_id')) {
            DB::statement('ALTER TABLE server_variables MODIFY variable_id INT UNSIGNED NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('server_variables', 'server_id')) {
            DB::statement('ALTER TABLE server_variables MODIFY server_id INT NULL');
        }
        if (Schema::hasColumn('server_variables', 'variable_id')) {
            DB::statement('ALTER TABLE server_variables MODIFY variable_id INT NOT NULL');
        }
    }
};
