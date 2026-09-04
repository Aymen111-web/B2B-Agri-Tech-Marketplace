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
        Schema::table('payments', function (Blueprint $table) {
            // Safely drop the unique index if it exists
            try {
                $table->dropUnique('payments_order_id_unique');
            } catch (\Throwable) {
                // Already dropped or never existed — safe to ignore
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->unique('order_id', 'payments_order_id_unique');
        });
    }
};
