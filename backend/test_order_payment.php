<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$order = \App\Models\Order::latest()->first();
$user = \App\Models\User::find($order->buyer_id) ?? \App\Models\User::first();
$chapaService = app(\App\Services\ChapaService::class);
$txRef = 'TX-TEST-' . time();

$secretKey = config('services.chapa.secret_key');
$payload = [
    'amount'        => (float)$order->total_amount,
    'currency'      => $order->currency ?: 'ETB',
    'email'         => 'buyer@gmail.com',
    'first_name'    => 'Buyer',
    'last_name'     => 'User',
    'phone_number'  => '0912345678',
    'tx_ref'        => $txRef,
    'callback_url'  => config('services.chapa.callback_url'),
    'customization' => [
        'title'       => 'AgriMarket ET',
        'description' => "Order Payment {$order->order_number}",
    ],
    'meta' => $chapaService->buildInvoicesMeta($order),
];

$response = Illuminate\Support\Facades\Http::withToken($secretKey)
    ->post('https://api.chapa.co/v1/transaction/initialize', $payload);

echo "Order Total Amount: {$order->total_amount}\n";
echo json_encode($response->json(), JSON_PRETTY_PRINT) . "\n";
