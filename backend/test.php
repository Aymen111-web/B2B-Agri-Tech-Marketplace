<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Requests\StoreListingRequest;
use App\Models\User;

$user = User::find(2); // Aymen (farmer)
auth()->login($user);

$data = [
    'category_id' => 1,
    'title' => 'Test Listing',
    'description' => 'Test Desc',
    'unit' => 'kg',
    'price_per_unit' => 85,
    'quantity_available' => 5000,
    'minimum_order_quantity' => 500,
    'batch_number' => null,
    'harvest_date' => '2024-02-15',
    'quality_grade' => 'Grade 1',
];

$request = StoreListingRequest::create('/api/listings', 'POST', $data);
$request->setContainer(app());
$request->setRedirector(app(\Illuminate\Routing\Redirector::class));

try {
    $request->validateResolved();
    echo "Validation PASS!\n";
    
    $req = request();
    $req->replace($data);
    $controller = app(\App\Http\Controllers\ListingController::class);
    $res = $controller->store($request);
    echo "Store PASS: " . $res->getContent() . "\n";
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "VALIDATION FAILED:\n";
    print_r($e->errors());
} catch (\Throwable $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n" . $e->getFile() . ":" . $e->getLine() . "\n";
}
