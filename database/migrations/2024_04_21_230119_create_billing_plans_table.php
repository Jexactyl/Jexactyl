<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('billing_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id')->required();
            $table->uuid('uuid')->required();
            $table->string('name')->required();
            $table->double('price')->required();
            $table->string('description')->nullable();
            $table->unsignedInteger('cpu_limit')->required();
            $table->integer('memory_limit')->required();
            $table->integer('disk_limit')->required();
            $table->unsignedInteger('backup_limit')->required();
            $table->unsignedInteger('database_limit')->required();
            $table->unsignedInteger('allocation_limit')->required();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_plans');
    }
};
