<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Http;

$secretKey = config('services.chapa.secret_key');

$payload = [
    'amount'        => 100,
    'currency'      => 'ETB',
    'email'         => 'buyer@gmail.com',
    'first_name'    => 'Buyer',
    'last_name'     => 'User',
    'phone_number'  => '0912345678',
    'tx_ref'        => 'TX-TEST-' . time(),
    'callback_url'  => 'http://127.0.0.1:8000/api/payments/callback',
    'return_url'    => 'http://localhost:5173/payment/success',
    'customization' => [
        'title'       => 'AgriMarket ET',
        'description' => 'Order Payment ORD-123456',
    ],
];

$res = Http::withToken($secretKey)->post('https://api.chapa.co/v1/transaction/initialize', $payload);

echo "Status: " . $res->status() . "\n";
echo "Response:\n";
print_r($res->json());
