<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->string('batch_number', 50)->nullable()->after('unit');
            $table->date('harvest_date')->nullable()->after('batch_number');
            $table->string('quality_grade', 20)->nullable()->after('harvest_date'); // e.g. Grade A, Grade B
            $table->decimal('minimum_order_quantity', 12, 3)->default(1.000)->after('quality_grade');

            $table->timestamp('price_valid_from')->nullable()->after('price_per_unit');
            $table->timestamp('price_valid_until')->nullable()->after('price_valid_from');
            $table->decimal('reference_market_price', 12, 2)->nullable()->after('price_valid_until'); // Benchmark reference price (e.g. Mercato)
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn([
                'batch_number',
                'harvest_date',
                'quality_grade',
                'minimum_order_quantity',
                'price_valid_from',
                'price_valid_until',
                'reference_market_price',
            ]);
        });
    }
};
