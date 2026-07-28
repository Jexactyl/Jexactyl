<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * The "expires_at" column was originally a date column, which cannot represent a
     * minute-level delay (the entire feature was a no-op as a result, since any delay
     * under 24 hours rounded down to "today"). Widen it to a timestamp so delays of a
     * few minutes or hours can actually be enforced.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE `jguard_delay` MODIFY `expires_at` TIMESTAMP NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE `jguard_delay` MODIFY `expires_at` DATE NOT NULL');
    }
};
