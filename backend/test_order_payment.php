<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$order = \App\Models\Order::latest()->first();
$user = \App\Models\User::find($order->buyer_id) ?? \App\Models\User::first();
$chapaService = app(\App\Services\ChapaService::class);
$txRef = 'TX-TEST-' . time();

echo "Testing Order ID: {$order->id}, Original Amount: {$order->total_amount}\n";

$res = $chapaService->initializeOrderPayment($order, $user, $txRef);

echo json_encode($res, JSON_PRETTY_PRINT) . "\n";
