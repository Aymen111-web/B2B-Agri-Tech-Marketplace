<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test the exact request ChapaService makes
$payload = [
    'amount'        => 100,
    'currency'      => 'ETB',
    'email'         => 'buyer@gmail.com',
    'first_name'    => 'Buyer',
    'last_name'     => 'User',
    'phone_number'  => '0912345678',
    'tx_ref'        => 'TX-TEST-' . rand(1000, 9999),
    'callback_url'  => 'http://127.0.0.1:8000/api/payments/callback',
    'customization' => [
        'title'       => 'Test',
        'description' => 'Test Desc',
    ]
];

$secretKey = config('services.chapa.secret_key');
if (!$secretKey) {
    echo "No secret key configured\n";
    exit;
}

$response = Illuminate\Support\Facades\Http::withToken($secretKey)
    ->post('https://api.chapa.co/v1/transaction/initialize', $payload);

echo "Status: " . $response->status() . "\n";
echo "Body: " . $response->body() . "\n";
