<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$order = \App\Models\Order::latest()->first();
echo "Order ID: {$order->id}, Number: {$order->order_number}, Status: {$order->status}\n";

$pendingPayment = \App\Models\Payment::where('order_id', $order->id)->latest()->first();
if ($pendingPayment) {
    echo "Payment TxRef: {$pendingPayment->chapa_tx_ref}, Payment Status: {$pendingPayment->status}\n";
} else {
    echo "No payment record found for order\n";
}
