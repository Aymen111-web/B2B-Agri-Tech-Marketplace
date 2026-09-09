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
        if ((string) $order->delivery_pin !== (string) $pin) {
            throw new \RuntimeException('Invalid delivery PIN. Please verify the 6-digit PIN with the transport driver.');
        }

        DB::transaction(function () use ($order) {
            $oldStatus = $order->status;

            $order->update([
                'status'                   => \App\Models\Order::STATUS_COMPLETED,
                'delivery_status'          => 'delivered',
                'inspection_status'        => 'approved',
                'payout_status'            => 'released',
                'delivery_pin_verified_at' => now(),
            ]);

            foreach ($order->fulfillments as $fulfillment) {
                // Deduct final reserved stock quantities natively
                foreach ($fulfillment->items as $item) {
                    $listing = \App\Models\Listing::where('id', $item->listing_id)->lockForUpdate()->first();
                    if ($listing) {
                        $listing->decrement('quantity_reserved', (float) $item->quantity);
                    }
                }

                $fulfillment->update([
                    'status'            => 'completed',
                    'delivery_status'   => 'delivered',
                    'inspection_status' => 'approved',
                    'payout_status'     => 'eligible',
                    'completed_at'      => now(),
                ]);

                // Step 5: Automatic Farmer Financial Payout creation
                $existingPayout = \App\Models\Payout::where('order_fulfillment_id', $fulfillment->id)->first();
                if (! $existingPayout) {
                    $payoutAmount = (float) ($fulfillment->farmer_net_payout ?: $fulfillment->subtotal_amount);
                    if ($payoutAmount <= 0) {
                        $payoutAmount = (float) $fulfillment->subtotal_amount;
                    }

                    \App\Models\Payout::create([
                        'farmer_id'            => $fulfillment->farmer_id,
                        'order_fulfillment_id' => $fulfillment->id,
                        'amount'               => $payoutAmount,
                        'status'               => 'processed',
                        'reference'            => 'ESCROW-RELEASE-' . strtoupper(\Illuminate\Support\Str::random(6)),
                        'processed_at'         => now(),
                    ]);
                }
            }

            // Record compliance audit log
            \App\Services\AuditService::log(
                'order.delivery_pin_verified',
                $order,
                ['status' => $oldStatus],
                [
                    'status'        => \App\Models\Order::STATUS_COMPLETED,
                    'escrow_status' => 'released',
                    'payout_status' => 'released',
                ]
            );
        });

        return true;
    }
}
