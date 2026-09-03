<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$order = \App\Models\Order::first();
$user = \App\Models\User::first();
$service = app(\App\Services\ChapaService::class);

$txRef = 'TX-TEST-' . time();
$res = $service->initializeOrderPayment($order, $user, $txRef);

echo "SUCCESS: " . ($res['success'] ? 'YES' : 'NO') . "\n";
echo "CHECKOUT URL: " . ($res['checkout_url'] ?? 'NONE') . "\n";
