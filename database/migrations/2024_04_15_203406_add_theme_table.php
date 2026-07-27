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
        // Installs upgrading from v3.7.x already have a `theme` table, but
        // in its legacy single-row `background` shape (added by their own
        // 2022_06_17_223301_add_theme_table migration, no primary key).
        // Preserve the configured background as the first row of the new
        // key/value table rather than failing on "table already exists".
        if (Schema::hasTable('theme')) {
            if (!Schema::hasColumn('theme', 'key')) {
                $legacyBackground = DB::table('theme')->value('background');

                Schema::drop('theme');

                Schema::create('theme', function (Blueprint $table) {
                    $table->increments('id');
                    $table->string('key')->unique();
                    $table->text('value');
                });

                if ($legacyBackground !== null) {
                    DB::table('theme')->insert(['key' => 'background', 'value' => $legacyBackground]);
                }
            }

            return;
        }

        Schema::create('theme', function (Blueprint $table) {
            $table->increments('id');
            $table->string('key')->unique();
            $table->text('value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theme');
    }
};
