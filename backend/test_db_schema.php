<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$res = \Illuminate\Support\Facades\DB::select("SHOW CREATE TABLE order_fulfillments");
file_put_contents('err.txt', json_encode($res, JSON_PRETTY_PRINT));
echo "Saved schema to err.txt\n";
