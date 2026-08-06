<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * Note that these rows are deliberately not soft-deleted. A soft-deleted row would keep
     * occupying the unique index on `credential_id`, which would permanently prevent a user
     * from re-registering the same authenticator after removing it.
     */
    public function up(): void
    {
        Schema::create('user_passkeys', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('credential_id', 255)->unique();
            $table->text('credential');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_passkeys');
    }
};
