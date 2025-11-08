<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RemoveLocationsForeignKeyFromNodes extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('nodes', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['location_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
}
