<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (config('database.default') === 'mysql') {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE order_fulfillments MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'pending'");
        } else {
            Schema::table('order_fulfillments', function (Blueprint $table) {
                $table->string('status', 30)->default('pending')->change();
            });
        }
    }

    public function down(): void
    {
        if (config('database.default') === 'mysql') {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE order_fulfillments MODIFY COLUMN status ENUM('pending', 'accepted', 'paid_in_escrow', 'dispatched', 'in_transit', 'buyer_received', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending'");
        } else {
            Schema::table('order_fulfillments', function (Blueprint $table) {
                $table->string('status', 30)->default('pending')->change();
            });
        }
    }
};
