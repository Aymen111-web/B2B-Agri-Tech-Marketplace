<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_fulfillments', function (Blueprint $table) {
            $table->string('delivery_status', 30)->default('pending')->after('status');
            $table->string('inspection_status', 30)->default('pending')->after('delivery_status');
            $table->string('payout_status', 30)->default('pending')->after('inspection_status');

            $table->decimal('accepted_quantity', 12, 3)->nullable()->after('subtotal_amount');
            $table->decimal('rejected_quantity', 12, 3)->nullable()->after('accepted_quantity');
            $table->text('inspection_notes')->nullable()->after('rejected_quantity');
            $table->timestamp('inspected_at')->nullable()->after('inspection_notes');
        });
    }

    public function down(): void
    {
        Schema::table('order_fulfillments', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_status',
                'inspection_status',
                'payout_status',
                'accepted_quantity',
                'rejected_quantity',
                'inspection_notes',
                'inspected_at',
            ]);
        });
    }
};
