<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

class DeliveryService
{
    /**
     * Verify the 6-digit delivery handoff PIN.
     */
    public function verifyHandoffPin(Order $order, string $pin): bool
    {
        if ($order->delivery_pin !== $pin) {
            return false;
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'delivery_status'          => 'delivered',
                'delivery_pin_verified_at' => now(),
            ]);

            foreach ($order->fulfillments as $fulfillment) {
                $fulfillment->update([
                    'delivery_status'   => 'delivered',
                    'inspection_status' => 'pending',
                ]);
            }
        });

        return true;
    }
}
