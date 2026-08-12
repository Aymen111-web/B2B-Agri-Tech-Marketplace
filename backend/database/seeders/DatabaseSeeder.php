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
        // Admin user
        User::factory()->create([
            'first_name'        => 'Admin',
            'second_name'       => 'System',
            'phone'             => '+251911000000',
            'is_admin'          => true,
            'phone_verified_at' => now(),
            'account_status'    => 'active',
        ]);

        // Demo Farmer user
        User::factory()->create([
            'first_name'        => 'Abebe',
            'second_name'       => 'Bikila',
            'phone'             => '+251911111111',
            'is_admin'          => false,
            'phone_verified_at' => now(),
            'account_status'    => 'active',
        ]);

        // Demo Buyer user
        User::factory()->create([
            'first_name'        => 'Kebede',
            'second_name'       => 'Tessema',
            'phone'             => '+251922222222',
            'is_admin'          => false,
            'phone_verified_at' => now(),
            'account_status'    => 'active',
        ]);

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
