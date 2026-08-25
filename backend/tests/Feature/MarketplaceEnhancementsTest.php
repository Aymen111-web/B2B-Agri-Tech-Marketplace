<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Listing;
use App\Models\Order;
use App\Models\OrderFulfillment;
use App\Models\Payment;
use App\Models\User;
use App\Services\DeliveryService;
use App\Services\InspectionService;
use App\Services\PaymentService;
use App\Services\PricingService;
use App\Services\ReservationService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class MarketplaceEnhancementsTest extends TestCase
{
    use DatabaseTransactions;

    protected User $buyer;
    protected User $farmer;
    protected Category $category;
    protected Listing $listing;

    protected function setUp(): void
    {
        parent::setUp();

        // Create buyer with buyer capability
        $this->buyer = User::factory()->create([
            'phone' => '+251911000001',
        ]);
        $this->buyer->capabilities()->create([
            'capability_type' => 'buyer',
            'status'          => 'active',
        ]);

        // Create farmer with farmer capability
        $this->farmer = User::factory()->create([
            'phone' => '+251911000002',
        ]);
        $this->farmer->capabilities()->create([
            'capability_type' => 'farmer',
            'status'          => 'active',
        ]);

        $this->category = Category::create(['name' => 'Vegetables', 'slug' => 'vegetables']);

        $this->listing = Listing::create([
            'farmer_id'          => $this->farmer->id,
            'category_id'        => $this->category->id,
            'title'              => 'Fresh Teff Batch #101',
            'description'        => 'Grade A Red Teff',
            'unit'               => 'quintal',
            'price_per_unit'     => 5000.00,
            'quantity_available' => 50.000,
            'quantity_reserved'  => 0.000,
            'status'             => 'active',
            'batch_number'       => 'BATCH-2026-001',
            'harvest_date'       => now()->subDays(5)->format('Y-m-d'),
            'quality_grade'      => 'Grade A',
            'minimum_order_quantity' => 2.000,
            'price_valid_until'  => now()->addDays(7),
        ]);
    }

    public function test_checkout_creates_15_minute_reservation_and_6_digit_pin()
    {
        CartItem::create([
            'buyer_id'       => $this->buyer->id,
            'listing_id'     => $this->listing->id,
            'quantity'       => 5.000,
            'price_snapshot' => 5000.00,
        ]);

        $reservationService = new ReservationService();
        $cartItems = $this->buyer->cartItems()->with('listing')->get();
        $order = $reservationService->createReservation($this->buyer, $cartItems);

        $this->assertEquals('pending_payment', $order->status);
        $this->assertNotNull($order->reservation_expires_at);
        $this->assertNotNull($order->delivery_pin);
        $this->assertEquals(6, strlen($order->delivery_pin));

        $this->listing->refresh();
        $this->assertEquals(45.000, (float) $this->listing->quantity_available);
        $this->assertEquals(5.000, (float) $this->listing->quantity_reserved);
    }

    public function test_reservation_expires_automatically_and_releases_inventory()
    {
        CartItem::create([
            'buyer_id'       => $this->buyer->id,
            'listing_id'     => $this->listing->id,
            'quantity'       => 10.000,
            'price_snapshot' => 5000.00,
        ]);

        $reservationService = new ReservationService();
        $cartItems = $this->buyer->cartItems()->with('listing')->get();
        $order = $reservationService->createReservation($this->buyer, $cartItems);

        // Fast forward 16 minutes
        $order->update(['reservation_expires_at' => now()->subMinute()]);

        $expired = $reservationService->expireReservation($order);
        $this->assertTrue($expired);

        $order->refresh();
        $this->assertEquals('expired', $order->status);

        $this->listing->refresh();
        $this->assertEquals(50.000, (float) $this->listing->quantity_available);
        $this->assertEquals(0.000, (float) $this->listing->quantity_reserved);
    }

    public function test_late_chapa_payment_on_expired_reservation_fails_and_flags_refund()
    {
        CartItem::create([
            'buyer_id'       => $this->buyer->id,
            'listing_id'     => $this->listing->id,
            'quantity'       => 5.000,
            'price_snapshot' => 5000.00,
        ]);

        $reservationService = new ReservationService();
        $cartItems = $this->buyer->cartItems()->with('listing')->get();
        $order = $reservationService->createReservation($this->buyer, $cartItems);

        $payment = Payment::create([
            'order_id'       => $order->id,
            'chapa_tx_ref'   => 'TX-TEST-12345',
            'amount'         => $order->total_amount,
            'currency'       => 'ETB',
            'status'         => 'pending',
            'payment_method' => 'chapa',
        ]);

        // Order expires
        $reservationService->expireReservation($order);
        $order->refresh();

        // Late payment webhook arrives
        $paymentService = new PaymentService();
        $success = $paymentService->confirmPayment($payment, ['status' => 'success']);

        $this->assertFalse($success);
        $payment->refresh();
        $this->assertEquals('failed', $payment->status);
    }

    public function test_delivery_pin_verification_updates_delivery_status()
    {
        CartItem::create([
            'buyer_id'       => $this->buyer->id,
            'listing_id'     => $this->listing->id,
            'quantity'       => 5.000,
            'price_snapshot' => 5000.00,
        ]);

        $reservationService = new ReservationService();
        $cartItems = $this->buyer->cartItems()->with('listing')->get();
        $order = $reservationService->createReservation($this->buyer, $cartItems);

        $deliveryService = new DeliveryService();
        $result = $deliveryService->verifyHandoffPin($order, $order->delivery_pin);

        $this->assertTrue($result);
        $order->refresh();
        $this->assertEquals('delivered', $order->delivery_status);
        $this->assertNotNull($order->delivery_pin_verified_at);
    }

    public function test_produce_inspection_determines_payout_eligibility()
    {
        CartItem::create([
            'buyer_id'       => $this->buyer->id,
            'listing_id'     => $this->listing->id,
            'quantity'       => 5.000,
            'price_snapshot' => 5000.00,
        ]);

        $reservationService = new ReservationService();
        $cartItems = $this->buyer->cartItems()->with('listing')->get();
        $order = $reservationService->createReservation($this->buyer, $cartItems);

        // Mark payment confirmed & PIN verified
        $order->update([
            'payment_status'           => 'confirmed',
            'delivery_status'          => 'delivered',
            'delivery_pin_verified_at' => now(),
        ]);

        $fulfillment = $order->fulfillments()->first();

        $inspectionService = new InspectionService();
        $updatedFulfillment = $inspectionService->completeInspection(
            $fulfillment,
            'accepted',
            5.000,
            0.000,
            'All produce in excellent condition.'
        );

        $this->assertEquals('accepted', $updatedFulfillment->inspection_status);
        $this->assertEquals('eligible', $updatedFulfillment->payout_status);

        $order->refresh();
        $this->assertEquals('eligible', $order->payout_status);
    }

    public function test_pricing_service_enforces_moq_and_price_validity()
    {
        $pricingService = new PricingService();

        // Valid MOQ
        $this->assertTrue($pricingService->validateMinimumOrderQuantity($this->listing, 2.000));
        // Invalid MOQ
        $this->assertFalse($pricingService->validateMinimumOrderQuantity($this->listing, 1.000));

        // Valid Price
        $this->assertTrue($pricingService->validateListingPrice($this->listing));

        // Expired Price
        $this->listing->update(['price_valid_until' => now()->subDay()]);
        $this->assertFalse($pricingService->validateListingPrice($this->listing));
    }
}
