<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $order = \App\Models\Order::find(4);
    $payment = \App\Models\Payment::where('order_id', $order->id)->latest()->first();
    $paymentService = app(\App\Services\PaymentService::class);

    $result = $paymentService->confirmPayment($payment, ['simulated' => true]);

    $order->refresh();
    echo "SUCCESS: Order status is now {$order->status}, payment status is {$order->payment_status}\n";
} catch (\Throwable $e) {
    file_put_contents('err.txt', $e->getMessage());
    echo "Wrote error to err.txt\n";
}
