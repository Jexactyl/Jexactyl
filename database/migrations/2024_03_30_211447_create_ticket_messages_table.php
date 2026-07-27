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
        // Installs upgrading from v3.7.x already have a `ticket_messages`
        // table from their own 2022_12_13_192408_create_ticket_messages_table
        // migration, using a `content` column instead of `message`. Reshape
        // in place rather than failing on "table already exists".
        if (Schema::hasTable('ticket_messages')) {
            if (Schema::hasColumn('ticket_messages', 'content')) {
                Schema::table('ticket_messages', function (Blueprint $table) {
                    $table->renameColumn('content', 'message');
                });
            }
        } else {
            Schema::create('ticket_messages', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('user_id');
                $table->unsignedInteger('ticket_id');
                $table->text('message');
                $table->timestamps();
            });
        }

        // The legacy `tickets` table (see the preceding migration) stored
        // the ticket's opening message directly on the ticket row, in a
        // `content` column, rather than as a ticket_messages row. Carry it
        // over as the first message so existing ticket history isn't lost,
        // then drop the columns that no longer exist in the v4 schema.
        if (Schema::hasColumn('tickets', 'content')) {
            DB::table('tickets')
                ->select('id', 'user_id', 'content', 'created_at')
                ->whereNotNull('content')
                ->where('content', '!=', '')
                ->orderBy('id')
                ->each(function ($ticket) {
                    DB::table('ticket_messages')->insert([
                        'user_id' => $ticket->user_id,
                        'ticket_id' => $ticket->id,
                        'message' => $ticket->content,
                        'created_at' => $ticket->created_at,
                        'updated_at' => $ticket->created_at,
                    ]);
                });

            Schema::table('tickets', function (Blueprint $table) {
                $table->dropColumn('content');
            });
        }

        if (Schema::hasColumn('tickets', 'message_count')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->dropColumn('message_count');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_messages');
    }
};
