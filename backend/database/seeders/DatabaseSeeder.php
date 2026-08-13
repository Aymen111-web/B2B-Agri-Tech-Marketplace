<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin user (0708943727 / admin123456)
        User::updateOrCreate(
            ['phone' => '+251708943727'],
            [
                'first_name'        => 'Admin',
                'second_name'       => 'User',
                'password'          => \Illuminate\Support\Facades\Hash::make('admin123456'),
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
                'password'          => \Illuminate\Support\Facades\Hash::make('password'),
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
                'password'          => \Illuminate\Support\Facades\Hash::make('password'),
                'is_admin'          => false,
                'phone_verified_at' => now(),
                'account_status'    => 'active',
            ]
        );

        // Seed default marketplace categories
        $categories = [
            ['name' => 'Teff', 'slug' => 'teff', 'is_active' => true],
            ['name' => 'Coffee', 'slug' => 'coffee', 'is_active' => true],
            ['name' => 'Grains & Pulses', 'slug' => 'grains-pulses', 'is_active' => true],
            ['name' => 'Vegetables', 'slug' => 'vegetables', 'is_active' => true],
            ['name' => 'Fruits', 'slug' => 'fruits', 'is_active' => true],
            ['name' => 'Spices', 'slug' => 'spices', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
