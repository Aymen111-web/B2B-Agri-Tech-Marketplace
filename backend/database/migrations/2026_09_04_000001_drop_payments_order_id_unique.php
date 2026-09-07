<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop the unique constraint on payments.order_id so that multiple
     * fulfillment payments can be created for the same order.
     */
    public function up(): void
    {
        try {
            Schema::table('payments', function (Blueprint $table) {
                $table->dropForeign(['order_id']);
            });
        } catch (\Throwable) {}

        try {
            Schema::table('payments', function (Blueprint $table) {
                $table->dropUnique('payments_order_id_unique');
            });
        } catch (\Throwable) {}

        try {
            Schema::table('payments', function (Blueprint $table) {
                $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            });
        } catch (\Throwable) {}
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->unique('order_id', 'payments_order_id_unique');
        });
    }
};
