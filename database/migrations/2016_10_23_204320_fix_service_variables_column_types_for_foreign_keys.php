<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * The service_variables table itself was renamed to egg_variables by
     * 2017_10_06_215741_ServiceVariablesToEggVariablesConversion. hasColumn()
     * returns false once that rename has happened, guarding this statement.
     */
    public function up(): void
    {
        if (Schema::hasColumn('service_variables', 'option_id')) {
            DB::statement('ALTER TABLE service_variables MODIFY option_id INT UNSIGNED NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('service_variables', 'option_id')) {
            DB::statement('ALTER TABLE service_variables MODIFY option_id INT NOT NULL');
        }
    }
};
