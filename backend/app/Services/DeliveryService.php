<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderFulfillment;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DeliveryService
{
    /**
     * Verify the 6-digit delivery handoff PIN for an order.
     */
    public function verifyHandoffPin(Order $order, string $pin): bool
    {
        if (empty($order->delivery_pin) || trim($pin) !== trim($order->delivery_pin)) {
            throw new RuntimeException('Invalid delivery PIN.');
        }

        if ($order->delivery_pin_verified_at !== null) {
            throw new RuntimeException('Delivery PIN has already been verified for this order.');
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'delivery_status'          => 'delivered',
                'delivery_pin_verified_at' => now(),
            ]);

            $order->fulfillments()->update([
                'delivery_status' => 'delivered',
            ]);
        });

        return true;
    }

    /**
     * Mark a fulfillment as dispatched by the farmer/delivery operator.
     */
    public function markDispatched(OrderFulfillment $fulfillment): OrderFulfillment
    {
        DB::transaction(function () use ($fulfillment) {
            $fulfillment->update([
                'delivery_status' => 'dispatched',
            ]);

            $order = $fulfillment->order;
            if ($order && $order->delivery_status === 'pending') {
                $order->update([
                    'delivery_status' => 'dispatched',
                ]);
            }
        });

        return $fulfillment->fresh();
    }
}
