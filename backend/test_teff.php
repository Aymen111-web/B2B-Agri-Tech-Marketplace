<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$listing = \App\Models\Listing::where('title', 'like', '%Premium Red Teff%')->first();
if ($listing) {
    echo json_encode([
        'title' => $listing->title,
        'quantity_available' => $listing->quantity_available,
        'min_order_qty' => $listing->minimum_order_quantity
    ], JSON_PRETTY_PRINT);
} else {
    echo "Not found";
}
