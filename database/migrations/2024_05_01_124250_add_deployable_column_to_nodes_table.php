<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Installs upgrading from v3.7.x already have this column, added by
        // their own 2022_08_10_134436_add_deployable_column_to_nodes_table
        // migration. Skip so we don't clobber real per-node values or fail
        // with "column already exists".
        if (Schema::hasColumn('nodes', 'deployable')) {
            return;
        }

        Schema::table('nodes', function (Blueprint $table) {
            $table->boolean('deployable')->nullable()->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nodes', function (Blueprint $table) {
            $table->dropColumn('deployable');
        });
    }
};
