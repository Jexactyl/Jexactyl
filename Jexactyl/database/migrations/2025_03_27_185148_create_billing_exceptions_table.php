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
        Schema::create('billing_exceptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->required();
            $table->unsignedInteger('order_id')->nullable();
            $table->text('title');
            $table->text('description');
            $table->string('exception_type');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_exceptions');
    }
};
