<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_fetch_dashboard_stats()
    {
        $admin = User::create([
            'first_name'     => 'Admin',
            'second_name'    => 'User',
            'phone'          => '+251711111111',
            'password'       => 'password',
            'is_admin'       => true,
            'account_status' => 'active',
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'kpis' => [
                    'total_gmv',
                    'total_orders',
                    'verified_farmers',
                    'verified_buyers',
                    'pending_applications',
                    'active_listings',
                    'pending_payouts_count',
                    'pending_payouts_amount',
                    'payment_exceptions_count',
                ],
                'recent_activity',
                'pending_applications',
                'category_distribution',
            ]);
    }

    public function test_non_admin_cannot_access_dashboard_stats()
    {
        $buyer = User::create([
            'first_name'     => 'Regular',
            'second_name'    => 'Buyer',
            'phone'          => '+251933333333',
            'password'       => 'password',
            'is_admin'       => false,
            'account_status' => 'active',
        ]);

        $response = $this->actingAs($buyer)
            ->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(403);
    }
}
