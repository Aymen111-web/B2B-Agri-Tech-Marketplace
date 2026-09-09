<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$order = \App\Models\Order::latest()->first();
echo "Order ID: {$order->id}\n";
echo "Order Number: {$order->order_number}\n";
echo "Order Status: {$order->status}\n";
echo "Payment Status: {$order->payment_status}\n";
echo "Reservation Expires At: {$order->reservation_expires_at}\n";
echo "Current Time Now: " . now() . "\n";
echo "Has Expired? " . (now()->gt($order->reservation_expires_at) ? 'YES' : 'NO') . "\n";

$payment = \App\Models\Payment::where('order_id', $order->id)->latest()->first();
if ($payment) {
    echo "Payment ID: {$payment->id}, Payment Status: {$payment->status}, TxRef: {$payment->chapa_tx_ref}\n";
}
