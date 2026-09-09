<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE payment_exceptions MODIFY COLUMN type VARCHAR(50) NOT NULL DEFAULT 'dispute'");
            DB::statement("ALTER TABLE payment_exceptions MODIFY COLUMN payment_id BIGINT UNSIGNED NULL");
        } else {
            Schema::table('payment_exceptions', function (Blueprint $table) {
                $table->string('type', 50)->default('dispute')->change();
                $table->foreignId('payment_id')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE payment_exceptions MODIFY COLUMN type ENUM('dispute', 'mismatch', 'failed_payment_review', 'refund_request', 'other') NOT NULL DEFAULT 'dispute'");
        } else {
            Schema::table('payment_exceptions', function (Blueprint $table) {
                $table->string('type', 50)->default('dispute')->change();
            });
        }
    }
};
