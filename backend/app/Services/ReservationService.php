<?php

namespace App\Services;

use App\Models\Listing;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    /**
     * Create a 15-minute stock reservation for a new order.
     */
    public function createReservation(int $buyerId, array $cartItems): Order
    {
        return DB::transaction(function () use ($buyerId, $cartItems) {
            $totalAmount = 0;
            $orderItemsData = [];

            // Generate cryptographically secure 6-digit handoff PIN
            $deliveryPin = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            $order = Order::create([
                'order_number'           => 'ORD-' . date('Y') . '-' . str_pad(random_int(1, 999999), 6, '0', STR_PAD_LEFT),
                'buyer_id'               => $buyerId,
                'status'                 => 'pending_payment',
                'payment_status'         => 'pending',
                'delivery_status'        => 'pending',
                'inspection_status'      => 'pending',
                'payout_status'          => 'locked',
                'total_amount'           => 0,
                'currency'               => 'ETB',
                'delivery_pin'           => $deliveryPin,
                'reservation_expires_at' => now()->addMinutes(config('marketplace.reservation_minutes', 15)),
                'placed_at'              => now(),
            ]);

            $fulfillments = [];

            foreach ($cartItems as $item) {
                // Atomic row locking for concurrency protection
                $listing = Listing::where('id', $item['listing_id'])->lockForUpdate()->firstOrFail();

                if ($listing->quantity_available < $item['quantity']) {
                    throw new \Exception("Insufficient available stock for listing: {$listing->title}");
                }

                // Reserve inventory
                $listing->decrement('quantity_available', $item['quantity']);
                $listing->increment('quantity_reserved', $item['quantity']);

                $itemSubtotal = $item['quantity'] * $item['price_snapshot'];
                $totalAmount += $itemSubtotal;

                $farmerId = $listing->farmer_id;
                if (!isset($fulfillments[$farmerId])) {
                    $fulfillments[$farmerId] = $order->fulfillments()->create([
                        'farmer_id'          => $farmerId,
                        'status'             => 'pending',
                        'delivery_status'   => 'pending',
                        'inspection_status' => 'pending',
                        'payout_status'     => 'locked',
                        'subtotal_amount'   => 0,
                    ]);
                }

                $fulfillment = $fulfillments[$farmerId];
                $fulfillment->increment('subtotal_amount', $itemSubtotal);

                OrderItem::create([
                    'order_id'             => $order->id,
                    'order_fulfillment_id' => $fulfillment->id,
                    'listing_id'           => $listing->id,
                    'quantity'             => $item['quantity'],
                    'unit_price'           => $item['price_snapshot'],
                    'subtotal'             => $itemSubtotal,
                ]);
            }

            $order->update(['total_amount' => $totalAmount]);

            return $order->fresh(['fulfillments.items', 'items']);
        });
    }

    /**
     * Automatically release expired stock reservations back to available inventory.
     */
    public function releaseExpiredReservations(): int
    {
        $expiredOrders = Order::where('status', 'pending_payment')
            ->where('reservation_expires_at', '<=', now())
            ->get();

        $count = 0;

        foreach ($expiredOrders as $order) {
            DB::transaction(function () use ($order, &$count) {
                foreach ($order->items as $item) {
                    $listing = Listing::where('id', $item->listing_id)->lockForUpdate()->first();
                    if ($listing) {
                        $releaseQty = min($item->quantity, $listing->quantity_reserved);
                        $listing->decrement('quantity_reserved', $releaseQty);
                        $listing->increment('quantity_available', $releaseQty);
                    }
                }

                $order->update(['status' => 'expired']);

                foreach ($order->fulfillments as $fulfillment) {
                    $fulfillment->update(['status' => 'cancelled']);
                }

                $count++;
            });
        }

        return $count;
    }
}
