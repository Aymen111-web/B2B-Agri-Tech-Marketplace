<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Listing;
use App\Models\Order;
use App\Models\OrderFulfillment;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class ReservationService
{
    /**
     * Create an order with atomic stock reservation and expiration timestamp.
     *
     * @param User $buyer
     * @param Collection<int, CartItem> $cartItems
     * @return Order
     * @throws RuntimeException
     */
    public function createReservation(User $buyer, Collection $cartItems): Order
    {
        if ($cartItems->isEmpty()) {
            throw new RuntimeException('Your cart is empty.');
        }

        $grouped = $cartItems->groupBy(fn (CartItem $item) => $item->listing->farmer_id);

        if ($grouped->has($buyer->id)) {
            throw new RuntimeException('You cannot order from your own listings. Please remove them from your cart.');
        }

        return DB::transaction(function () use ($buyer, $cartItems, $grouped) {
            $listingIds = $cartItems->pluck('listing_id')->unique()->toArray();

            // Lock rows for update to prevent concurrent over-selling
            $listings = Listing::whereIn('id', $listingIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $pricingService = new PricingService();

            foreach ($cartItems as $cartItem) {
                $listing = $listings->get($cartItem->listing_id);

                if (! $listing || $listing->status !== 'active') {
                    throw new RuntimeException("Listing \"{$cartItem->listing->title}\" is no longer active.");
                }

                if (! $pricingService->validateListingPrice($listing)) {
                    throw new RuntimeException("Listing \"{$listing->title}\" has an expired price.");
                }

                if (! $pricingService->validateMinimumOrderQuantity($listing, (float) $cartItem->quantity)) {
                    $moq = (float) $listing->minimum_order_quantity;
                    throw new RuntimeException("Order quantity for \"{$listing->title}\" is below the minimum required ({$moq} {$listing->unit}).");
                }

                if ((float) $cartItem->quantity > (float) $listing->quantity_available) {
                    throw new RuntimeException("Insufficient stock for \"{$listing->title}\". Available: {$listing->quantity_available}, requested: {$cartItem->quantity}.");
                }
            }

            $totalAmount = $cartItems->sum(function (CartItem $item) use ($listings) {
                $listing = $listings->get($item->listing_id);
                return (float) $item->quantity * (float) $listing->price_per_unit;
            });

            $durationMinutes = (int) config('marketplace.reservation_duration_minutes', 15);

            // Generate 6-digit delivery PIN
            $deliveryPin = sprintf('%06d', mt_rand(0, 999999));

            $order = Order::create([
                'order_number'           => 'ORD-' . date('Y') . '-' . strtoupper(Str::random(8)),
                'buyer_id'               => $buyer->id,
                'status'                 => 'pending_payment',
                'payment_status'         => 'pending',
                'delivery_status'        => 'pending',
                'inspection_status'      => 'pending',
                'payout_status'          => 'pending',
                'total_amount'           => round($totalAmount, 2),
                'currency'               => 'ETB',
                'placed_at'              => now(),
                'reservation_expires_at' => now()->addMinutes($durationMinutes),
                'delivery_pin'           => $deliveryPin,
            ]);

            foreach ($grouped as $farmerId => $farmerCartItems) {
                $fulfillmentSubtotal = 0;

                $fulfillment = OrderFulfillment::create([
                    'order_id'          => $order->id,
                    'farmer_id'         => $farmerId,
                    'status'            => 'pending',
                    'delivery_status'   => 'pending',
                    'inspection_status' => 'pending',
                    'payout_status'     => 'pending',
                    'subtotal_amount'   => 0,
                ]);

                foreach ($farmerCartItems as $cartItem) {
                    $listing   = $listings->get($cartItem->listing_id);
                    $unitPrice = (float) $listing->price_per_unit;
                    $quantity  = (float) $cartItem->quantity;
                    $subtotal  = round($unitPrice * $quantity, 2);

                    OrderItem::create([
                        'order_id'             => $order->id,
                        'order_fulfillment_id' => $fulfillment->id,
                        'listing_id'           => $cartItem->listing_id,
                        'quantity'             => $quantity,
                        'unit_price'           => $unitPrice,
                        'subtotal'             => $subtotal,
                    ]);

                    $listing->decrement('quantity_available', $quantity);
                    $listing->increment('quantity_reserved', $quantity);

                    $fulfillmentSubtotal += $subtotal;
                }

                $fulfillment->update([
                    'subtotal_amount' => round($fulfillmentSubtotal, 2),
                ]);
            }

            return $order;
        });
    }

    /**
     * Idempotently expire a pending reservation and release reserved stock.
     */
    public function expireReservation(Order $order): bool
    {
        return DB::transaction(function () use ($order) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

            if (! $lockedOrder) {
                return false;
            }

            // Only expire if status is pending_payment and payment is pending
            if ($lockedOrder->status !== 'pending_payment' || $lockedOrder->payment_status !== 'pending') {
                return false;
            }

            $orderItems = $lockedOrder->items()->with('listing')->get();

            foreach ($orderItems as $orderItem) {
                $listing = Listing::where('id', $orderItem->listing_id)
                    ->lockForUpdate()
                    ->first();

                if ($listing) {
                    $listing->increment('quantity_available', (float) $orderItem->quantity);
                    $listing->decrement('quantity_reserved', (float) $orderItem->quantity);
                }
            }

            $lockedOrder->fulfillments()->update([
                'status' => 'cancelled',
            ]);

            $lockedOrder->update([
                'status' => 'expired',
            ]);

            return true;
        });
    }

    /**
     * Check if an order's reservation has expired.
     */
    public function isExpired(Order $order): bool
    {
        if ($order->status === 'expired') {
            return true;
        }

        if ($order->status === 'pending_payment' && $order->reservation_expires_at && now()->greaterThan($order->reservation_expires_at)) {
            return true;
        }

        return false;
    }

    /**
     * Idempotently process all expired reservations.
     */
    public function expireStaleReservations(): int
    {
        $expiredOrders = Order::where('status', 'pending_payment')
            ->where('reservation_expires_at', '<=', now())
            ->get();

        $count = 0;
        foreach ($expiredOrders as $order) {
            if ($this->expireReservation($order)) {
                $count++;
            }
        }

        return $count;
    }
}
