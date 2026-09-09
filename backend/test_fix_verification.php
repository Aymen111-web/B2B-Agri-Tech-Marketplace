<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$order = \App\Models\Order::find(4);
$paymentService = app(\App\Services\PaymentService::class);
$chapaService = app(\App\Services\ChapaService::class);
$controller = app(\App\Http\Controllers\PaymentController::class);

$res = $controller->verifyOrderPayments($order->id, $chapaService, $paymentService);
$order->refresh();

echo "Final Status: " . $order->status . "\n";
echo "Final Payment Status: " . $order->payment_status . "\n";
