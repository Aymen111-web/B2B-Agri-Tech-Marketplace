<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE order_fulfillments MODIFY COLUMN status ENUM('pending', 'accepted', 'paid_in_escrow', 'dispatched', 'in_transit', 'buyer_received', 'rejected', 'completed', 'cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE order_fulfillments MODIFY COLUMN status ENUM('pending', 'accepted', 'buyer_received', 'rejected', 'completed', 'cancelled') DEFAULT 'pending'");
    }
};
