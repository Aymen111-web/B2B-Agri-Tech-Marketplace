<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = App\Models\User::all();
foreach($users as $u) {
    echo "ID: " . $u->id . " | Capabilities: " . $u->capabilities()->pluck('capability_type')->implode(', ') . "\n";
}


