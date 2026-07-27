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
        // Installs upgrading from v3.7.x already have a `tickets` table from
        // their own 2022_12_13_190432_create_tickets_table migration, using
        // client_id/staff_id instead of user_id/assigned_to, plus a `content`
        // and `message_count` column that moved to ticket_messages in v4.
        // Reshape the existing table in place rather than failing on
        // "table already exists" or discarding support ticket history.
        // The legacy `content`/`message_count` columns are left in place
        // here and consumed by the following ticket_messages migration,
        // which runs immediately after this one.
        if (Schema::hasTable('tickets')) {
            if (Schema::hasColumn('tickets', 'client_id')) {
                Schema::table('tickets', function (Blueprint $table) {
                    $table->renameColumn('client_id', 'user_id');
                });
            }
            if (Schema::hasColumn('tickets', 'staff_id')) {
                Schema::table('tickets', function (Blueprint $table) {
                    $table->renameColumn('staff_id', 'assigned_to');
                });
            }

            return;
        }

        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('status');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('assigned_to')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
