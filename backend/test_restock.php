<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
\Illuminate\Support\Facades\DB::table('listings')->update(['quantity_available' => 50000]);
echo "Stock updated!";
