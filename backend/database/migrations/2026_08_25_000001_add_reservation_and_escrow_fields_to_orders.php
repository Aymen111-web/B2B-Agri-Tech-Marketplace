<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('reservation_expires_at')->nullable()->after('placed_at');

            // Multi-state tracking fields
            $table->string('payment_status', 30)->default('pending')->after('status');
            $table->string('delivery_status', 30)->default('pending')->after('payment_status');
            $table->string('inspection_status', 30)->default('pending')->after('delivery_status');
            $table->string('payout_status', 30)->default('pending')->after('inspection_status');

            // Handoff PIN verification
            $table->string('delivery_pin', 6)->nullable()->after('payout_status');
            $table->timestamp('delivery_pin_verified_at')->nullable()->after('delivery_pin');

            $table->index(['status', 'reservation_expires_at']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status', 'reservation_expires_at']);
            $table->dropColumn([
                'reservation_expires_at',
                'payment_status',
                'delivery_status',
                'inspection_status',
                'payout_status',
                'delivery_pin',
                'delivery_pin_verified_at',
            ]);
        });
    }
};
