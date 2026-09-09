<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $order = \App\Models\Order::find(4);
    $payment = \App\Models\Payment::where('order_id', $order->id)->latest()->first();
    $paymentService = app(\App\Services\PaymentService::class);

    echo "Before - Order Status: {$order->status}, Payment Status: {$payment->status}\n";

    $result = $paymentService->confirmPayment($payment, ['simulated' => true]);

    $order->refresh();
    $payment->refresh();

    echo "After - Result: " . json_encode($result) . "\n";
    echo "After - Order Status: {$order->status}, Payment Status: {$payment->status}\n";
} catch (\Throwable $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
