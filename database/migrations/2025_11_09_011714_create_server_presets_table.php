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
        Schema::create('server_presets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('name');
            $table->text('description')->nullable();

            $table->unsignedInteger('cpu');
            $table->integer('memory');
            $table->integer('disk');

            $table->unsignedInteger('nest_id')->nullable();
            $table->unsignedInteger('egg_id')->nullable();

            $table->foreign('nest_id')->references('id')->on('nests')->nullOnDelete();
            $table->foreign('egg_id')->references('id')->on('eggs')->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('server_presets');
    }
};
