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
        Schema::table('users', function (Blueprint $table) {
            $table->string('oidc_iss', 191)->nullable()->after('external_id');
            $table->string('oidc_sub', 191)->nullable()->after('oidc_iss');

            // (iss, sub) is the stable, opaque identifier pair from OIDC. NULLs
            // are allowed (non-OIDC users) and MySQL/MariaDB treat NULLs as
            // distinct, so the uniqueness constraint only binds on linked rows.
            $table->unique(['oidc_iss', 'oidc_sub'], 'users_oidc_iss_sub_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_oidc_iss_sub_unique');
            $table->dropColumn(['oidc_iss', 'oidc_sub']);
        });
    }
};
