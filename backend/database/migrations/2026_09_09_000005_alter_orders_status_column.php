<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `orders` MODIFY COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'pending_payment'");
            DB::statement("ALTER TABLE `payouts` MODIFY COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'pending'");
            DB::statement("ALTER TABLE `payments` MODIFY COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'pending'");
        } else {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('status', 30)->default('pending_payment')->change();
            });
            Schema::table('payouts', function (Blueprint $table) {
                $table->string('status', 30)->default('pending')->change();
            });
            Schema::table('payments', function (Blueprint $table) {
                $table->string('status', 30)->default('pending')->change();
            });
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `orders` MODIFY COLUMN `status` ENUM('pending_payment','payment_confirmed','processing','partially_fulfilled','completed','cancelled') NOT NULL DEFAULT 'pending_payment'");
            DB::statement("ALTER TABLE `payouts` MODIFY COLUMN `status` ENUM('pending','processed','failed') NOT NULL DEFAULT 'pending'");
            DB::statement("ALTER TABLE `payments` MODIFY COLUMN `status` ENUM('pending','confirmed','failed','cancelled') NOT NULL DEFAULT 'pending'");
        } else {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('status', 30)->default('pending_payment')->change();
            });
        }
    }
};
