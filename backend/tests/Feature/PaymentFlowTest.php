<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Order;
use App\Models\OrderFulfillment;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\User;
use App\Models\UserCapability;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $farmer;
    protected User $buyer;
    protected Category $category;
    protected Listing $listing;
    protected Order $order;
    protected OrderFulfillment $fulfillment;
    protected Payment $payment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'first_name'     => 'Admin',
            'second_name'    => 'User',
            'phone'          => '+251700000001',
            'password'       => 'password',
            'is_admin'       => true,
            'account_status' => 'active',
        ]);

        $this->farmer = User::create([
            'first_name'     => 'Farmer',
            'second_name'    => 'Joe',
            'phone'          => '+251911111112',
            'password'       => 'password',
            'is_admin'       => false,
            'account_status' => 'active',
        ]);

        UserCapability::create([
            'user_id'         => $this->farmer->id,
            'capability_type' => 'farmer',
            'status'          => 'active',
            'granted_by'      => $this->admin->id,
        ]);

        $this->buyer = User::create([
            'first_name'     => 'Buyer',
            'second_name'    => 'Jane',
            'phone'          => '+251922222223',
            'password'       => 'password',
            'is_admin'       => false,
            'account_status' => 'active',
        ]);

        $this->category = Category::firstOrCreate(
            ['name' => 'Grains'],
            ['slug' => 'grains']
        );

        $this->listing = Listing::create([
            'farmer_id'          => $this->farmer->id,
            'category_id'        => $this->category->id,
            'title'              => 'Red Teff Batch',
            'unit'               => 'kg',
            'price_per_unit'     => 100.00,
            'quantity_available' => 500.000,
            'status'             => 'active',
        ]);

        $this->order = Order::create([
            'order_number' => 'ORD-TEST-1001',
            'buyer_id'     => $this->buyer->id,
            'total_amount' => 1000.00,
            'status'       => 'pending_payment',
            'delivery_pin' => '123456',
        ]);

        $this->fulfillment = OrderFulfillment::create([
            'order_id'        => $this->order->id,
            'farmer_id'       => $this->farmer->id,
            'subtotal_amount' => 1000.00,
            'status'          => 'accepted',
        ]);

        $this->payment = Payment::create([
            'order_id'     => $this->order->id,
            'chapa_tx_ref' => 'TX-ORDER-1001-XYZ123',
            'amount'       => 1000.00,
            'currency'     => 'ETB',
            'status'       => 'pending',
        ]);
    }

    public function test_verify_payment_does_not_autoconfirm_unverified_tx_ref()
    {
        // Calling verify for an unverified TX ref should NOT confirm payment
        $response = $this->actingAs($this->buyer, 'sanctum')
            ->getJson("/api/payments/verify/{$this->payment->chapa_tx_ref}");

        // Without secret key or gateway confirmation, response should fail/be pending
        $this->payment->refresh();
        $this->assertNotEquals('confirmed', $this->payment->status);
    }

    public function test_farmer_payouts_summary_returns_valid_data()
    {
        Payout::create([
            'farmer_id'            => $this->farmer->id,
            'order_fulfillment_id' => $this->fulfillment->id,
            'amount'               => 1000.00,
            'status'               => 'processed',
            'reference'            => 'PO-REF-001',
            'processed_at'         => now(),
        ]);

        $response = $this->actingAs($this->farmer, 'sanctum')
            ->getJson('/api/payouts/summary');

        $response->assertStatus(200)
            ->assertJsonPath('summary.total_paid_out', 1000)
            ->assertJsonPath('summary.currency', 'ETB');
    }

    public function test_farmer_can_list_payouts()
    {
        Payout::create([
            'farmer_id'            => $this->farmer->id,
            'order_fulfillment_id' => $this->fulfillment->id,
            'amount'               => 1000.00,
            'status'               => 'pending',
            'reference'            => 'PO-REF-002',
        ]);

        $response = $this->actingAs($this->farmer, 'sanctum')
            ->getJson('/api/payouts');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_admin_can_update_payout_status()
    {
        $payout = Payout::create([
            'farmer_id'            => $this->farmer->id,
            'order_fulfillment_id' => $this->fulfillment->id,
            'amount'               => 1000.00,
            'status'               => 'pending',
            'reference'            => 'PO-REF-003',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/payouts/{$payout->id}/status", [
                'status' => 'processed',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('payout.status', 'processed');

        $this->assertEquals('processed', $payout->fresh()->status);
        $this->assertNotNull($payout->fresh()->processed_at);
    }

    public function test_payment_confirmation_transitions_order_and_fulfillment_to_escrow()
    {
        $paymentService = app(\App\Services\PaymentService::class);
        $result = $paymentService->confirmPayment($this->payment);

        $this->assertEquals('confirmed', $result['payment']->status);

        $this->order->refresh();
        $this->assertEquals('paid_in_escrow', $this->order->status);
        $this->assertEquals('paid', $this->order->payment_status);
        $this->assertEquals('locked', $this->order->payout_status);
        $this->assertNotEmpty($this->order->delivery_pin);

        $this->fulfillment->refresh();
        $this->assertEquals('paid_in_escrow', $this->fulfillment->status);
        $this->assertEquals('locked', $this->fulfillment->payout_status);

        $this->assertDatabaseHas('audit_logs', [
            'action'         => 'payment.escrow_secured',
            'auditable_type' => Order::class,
            'auditable_id'   => $this->order->id,
        ]);
    }

    public function test_farmer_can_dispatch_order_fulfillment()
    {
        $this->fulfillment->update(['status' => 'paid_in_escrow']);
        $this->order->update(['status' => 'paid_in_escrow']);

        $response = $this->actingAs($this->farmer, 'sanctum')
            ->postJson("/api/fulfillments/{$this->fulfillment->id}/dispatch", [
                'note' => 'Produce packed and handed over to logistics driver.',
            ]);

        $response->assertStatus(200);

        $this->fulfillment->refresh();
        $this->assertEquals('dispatched', $this->fulfillment->status);

        $this->order->refresh();
        $this->assertEquals('in_transit', $this->order->delivery_status);

        $this->assertDatabaseHas('audit_logs', [
            'action'         => 'fulfillment.dispatched',
            'auditable_type' => OrderFulfillment::class,
            'auditable_id'   => $this->fulfillment->id,
        ]);
    }

    public function test_verify_delivery_pin_releases_escrow_and_creates_processed_payout()
    {
        $this->order->update([
            'status'       => 'dispatched',
            'delivery_pin' => '654321',
        ]);
        $this->fulfillment->update([
            'status'        => 'dispatched',
            'payout_status' => 'locked',
        ]);

        // Incorrect PIN must fail with 422
        $failResponse = $this->actingAs($this->buyer, 'sanctum')
            ->postJson("/api/orders/{$this->order->id}/verify-delivery-pin", [
                'pin' => '000000',
            ]);
        $failResponse->assertStatus(422);

        // Correct PIN must succeed with 200
        $successResponse = $this->actingAs($this->buyer, 'sanctum')
            ->postJson("/api/orders/{$this->order->id}/verify-delivery-pin", [
                'pin' => '654321',
            ]);

        $successResponse->assertStatus(200);

        $this->order->refresh();
        $this->assertEquals('completed', $this->order->status);
        $this->assertEquals('released', $this->order->payout_status);

        $this->fulfillment->refresh();
        $this->assertEquals('completed', $this->fulfillment->status);
        $this->assertEquals('eligible', $this->fulfillment->payout_status);

        // Payout automatically created for the farmer
        $payout = Payout::where('farmer_id', $this->farmer->id)
            ->where('order_fulfillment_id', $this->fulfillment->id)
            ->first();

        $this->assertNotNull($payout);
        $this->assertEquals('processed', $payout->status);
        $this->assertStringStartsWith('ESCROW-RELEASE-', $payout->reference);
        $this->assertEquals(1000.00, (float) $payout->amount);

        $this->assertDatabaseHas('audit_logs', [
            'action'         => 'order.delivery_pin_verified',
            'auditable_type' => Order::class,
            'auditable_id'   => $this->order->id,
        ]);
    }

    public function test_buyer_can_file_dispute_and_freezes_escrow()
    {
        $this->order->update([
            'status'        => 'paid_in_escrow',
            'payout_status' => 'locked',
        ]);

        $response = $this->actingAs($this->buyer, 'sanctum')
            ->postJson('/api/payment-exceptions', [
                'order_id'    => $this->order->id,
                'type'        => 'produce_damaged',
                'description' => 'Produce arrived crushed and spoiled in transport.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success');

        $this->order->refresh();
        $this->assertEquals('disputed', $this->order->status);
        $this->assertEquals('locked', $this->order->payout_status);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'dispute.filed',
        ]);
    }

    public function test_admin_can_resolve_dispute_with_refund_buyer()
    {
        $this->order->update([
            'status'         => 'disputed',
            'payment_status' => 'paid',
            'payout_status'  => 'locked',
        ]);

        $exception = \App\Models\PaymentException::create([
            'order_id'    => $this->order->id,
            'payment_id'  => $this->payment->id,
            'raised_by'   => $this->buyer->id,
            'type'        => 'produce_damaged',
            'description' => 'Damaged produce claim.',
            'status'      => 'open',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/admin/payment-exceptions/{$exception->id}/resolve", [
                'resolution_action' => 'refund_buyer',
                'resolution_notes'  => 'Inspection confirmed transport damage. Full refund issued to buyer.',
            ]);

        $response->assertStatus(200);

        $this->order->refresh();
        $this->assertEquals('cancelled', $this->order->status);
        $this->assertEquals('refunded', $this->order->payment_status);
        $this->assertEquals('refunded', $this->order->payout_status);

        $exception->refresh();
        $this->assertEquals('resolved', $exception->status);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'dispute.resolved_refund_buyer',
        ]);
    }

    public function test_admin_can_resolve_dispute_with_release_farmer()
    {
        $this->order->update([
            'status'         => 'disputed',
            'payment_status' => 'paid',
            'payout_status'  => 'locked',
        ]);

        $exception = \App\Models\PaymentException::create([
            'order_id'    => $this->order->id,
            'payment_id'  => $this->payment->id,
            'raised_by'   => $this->buyer->id,
            'type'        => 'quality_mismatch',
            'description' => 'Claiming moisture too high.',
            'status'      => 'open',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/admin/payment-exceptions/{$exception->id}/resolve", [
                'resolution_action' => 'release_farmer',
                'resolution_notes'  => 'Lab test confirmed moisture is within acceptable grade standards. Releasing funds to farmer.',
            ]);

        $response->assertStatus(200);

        $this->order->refresh();
        $this->assertEquals('completed', $this->order->status);
        $this->assertEquals('released', $this->order->payout_status);

        $payout = Payout::where('farmer_id', $this->farmer->id)->first();
        $this->assertNotNull($payout);
        $this->assertEquals('processed', $payout->status);

        $exception->refresh();
        $this->assertEquals('resolved', $exception->status);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'dispute.resolved_release_farmer',
        ]);
    }
}
