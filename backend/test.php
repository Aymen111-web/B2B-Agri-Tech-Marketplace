<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Models\User;

$user = User::find(2); // Aymen (farmer)
auth()->login($user);

$request = Request::create('/api/listings/my', 'GET');
$request->setContainer(app());
$request->setRedirector(app(\Illuminate\Routing\Redirector::class));

try {
    $controller = app(\App\Http\Controllers\ListingController::class);
    $res = $controller->my($request);
    echo "MY LISTINGS: " . $res->getContent() . "\n";
} catch (\Throwable $e) {
    echo "EXCEPTION THROWN: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
}



