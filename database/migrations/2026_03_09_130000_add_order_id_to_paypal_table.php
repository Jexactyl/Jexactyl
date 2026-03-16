<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddOrderIdToPaypalTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('paypal', function (Blueprint $table) {
            $table->string('order_id')->nullable()->after('user_id');
            $table->index(['user_id', 'order_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('paypal', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'order_id']);
            $table->dropColumn('order_id');
        });
    }
}
