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
        if (Schema::hasColumn('api_permissions', 'key_id')) {
            DB::statement('ALTER TABLE api_permissions MODIFY key_id INT UNSIGNED NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('api_permissions', 'key_id')) {
            DB::statement('ALTER TABLE api_permissions MODIFY key_id INT NOT NULL');
        }
    }
};
