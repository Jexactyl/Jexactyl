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
        Schema::table('billing_plans', function (Blueprint $table) {
            $table->string('state')->nullable()->default('processing');
            $table->unsignedInteger('bill_date')->nullable()->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_plans', function (Blueprint $table) {
            $table->dropColumn('state');
            $table->dropColumn('bill_date');
        });
    }
};
