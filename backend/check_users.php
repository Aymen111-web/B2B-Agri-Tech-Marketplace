<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;

echo "Total Users: " . User::count() . "\n";
foreach (User::all() as $u) {
    echo "ID: {$u->id} | Name: {$u->first_name} | Phone: {$u->phone}\n";
}

echo "\n--- Testing Login with 251922222222 / buyer123456 ---\n";
$request = Request::create('/api/login', 'POST', [
    'phone' => '251922222222',
    'password' => 'buyer123456',
]);

$controller = app(AuthController::class);
$response = $controller->login($request);

echo "Status Code: " . $response->getStatusCode() . "\n";
echo "Response Content:\n" . $response->getContent() . "\n";
