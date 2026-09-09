<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$order = \App\Models\Order::find(4);
$paymentService = app(\App\Services\PaymentService::class);
$chapaService = app(\App\Services\ChapaService::class);
$controller = app(\App\Http\Controllers\PaymentController::class);

echo "Initial Order Status: {$order->status}\n";

$res = $controller->verifyOrderPayments($order->id, $chapaService, $paymentService);

$order->refresh();
echo "Controller Response Status: " . $res->status() . "\n";
echo "Controller Response Content: " . $res->getContent() . "\n";
echo "Final Order Status in DB: {$order->status}\n";
echo "Final Payment Status in DB: {$order->payment_status}\n";
