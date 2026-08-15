<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin user
        User::firstOrCreate(
            ['phone' => '+251708943727'],
            [
                'first_name'        => 'Admin',
                'second_name'       => 'Aymen',
                'password'          => Hash::make('admin123456'),
                'is_admin'          => true,
                'phone_verified_at' => now(),
                'account_status'    => 'active',
            ]
        );

        // Demo Farmer user
        User::firstOrCreate(
            ['phone' => '+251911111111'],
            [
                'first_name'        => 'Abebe',
                'second_name'       => 'Bikila',
                'password'          => Hash::make('farmer123456'),
                'is_admin'          => false,
                'phone_verified_at' => now(),
                'account_status'    => 'active',
            ]
        );

        // Demo Buyer user
        User::firstOrCreate(
            ['phone' => '+251922222222'],
            [
                'first_name'        => 'Kebede',
                'second_name'       => 'Tessema',
                'password'          => Hash::make('buyer123456'),
                'is_admin'          => false,
                'phone_verified_at' => now(),
                'account_status'    => 'active',
            ]
        );

        // Seed default marketplace categories
        $categories = [
            ['name' => 'Cereals & Grains', 'slug' => 'cereals-grains', 'is_active' => true],
            ['name' => 'Pulses & Legumes', 'slug' => 'pulses-legumes', 'is_active' => true],
            ['name' => 'Oilseeds', 'slug' => 'oilseeds', 'is_active' => true],
            ['name' => 'Coffee', 'slug' => 'coffee', 'is_active' => true],
            ['name' => 'Vegetables', 'slug' => 'vegetables', 'is_active' => true],
            ['name' => 'Fruits', 'slug' => 'fruits', 'is_active' => true],
            ['name' => 'Spices & Herbs', 'slug' => 'spices-herbs', 'is_active' => true],
            ['name' => 'Honey & Bee Products', 'slug' => 'honey-bee-products', 'is_active' => true],
            ['name' => 'Dairy Products', 'slug' => 'dairy-products', 'is_active' => true],
            ['name' => 'Livestock', 'slug' => 'livestock', 'is_active' => true],
            ['name' => 'Seeds & Seedlings', 'slug' => 'seeds-seedlings', 'is_active' => true],
            ['name' => 'Other Agricultural Products', 'slug' => 'other-agricultural-products', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
