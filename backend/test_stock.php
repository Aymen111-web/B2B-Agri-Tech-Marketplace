<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$listing = \App\Models\Listing::find(2);
echo $listing ? $listing->quantity_available : 'Null';
