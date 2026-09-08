<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    \Illuminate\Support\Facades\DB::statement("
        ALTER TABLE order_fulfillments 
        MODIFY status ENUM('pending', 'accepted', 'paid_in_escrow', 'dispatched', 'in_transit', 'buyer_received', 'rejected', 'completed', 'cancelled') 
        DEFAULT 'pending'
    ");
    echo "Fulfillments ENUM patched successfully.\n";
} catch (\Exception $e) {
    echo "Fulfillments ENUM patch failed: " . $e->getMessage() . "\n";
}

try {
    \Illuminate\Support\Facades\DB::statement("
        ALTER TABLE orders 
        MODIFY status ENUM('pending_payment', 'pending_farmer_approval', 'awaiting_buyer_payment', 'paid_in_escrow', 'processing', 'partially_fulfilled', 'completed', 'cancelled', 'rejected') 
        DEFAULT 'pending_payment'
    ");
    echo "Orders ENUM patched successfully.\n";
} catch (\Exception $e) {
    echo "Orders ENUM patch failed: " . $e->getMessage() . "\n";
}
