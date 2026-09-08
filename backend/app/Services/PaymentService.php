<?php

namespace App\Services;

use App\Models\Listing;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Confirm a payment via Chapa webhook with reservation expiration check.
     */
    public function confirmPayment(Payment $payment, array $payload): array
    {
        return DB::transaction(function () use ($payment, $payload) {
            $order = $payment->order;

            // Late payment guard: If reservation expired before webhook arrived
            if ($order->status === 'expired' || ($order->reservation_expires_at && now()->gt($order->reservation_expires_at) && $order->status === 'pending_payment')) {
                $payment->update([
                    'status'           => 'failed',
                    'gateway_metadata' => array_merge($payload, ['refund_flag' => 'reservation_expired_late_payment']),
                ]);

                $order->update([
                    'status'         => 'expired',
                    'payment_status' => 'failed_refund_required',
                ]);

                return [
                    'status'  => 'refund_flagged',
                    'message' => 'Payment received after reservation expiration. Stock released; flagged for refund.',
                ];
            }

            // Normal payment confirmation
            $payment->update([
                'status'           => 'confirmed',
                'confirmed_at'     => now(),
                'gateway_metadata' => $payload,
            ]);

            // Convert quantity_reserved to finalized sold inventory
            foreach ($order->items as $item) {
                $listing = Listing::where('id', $item->listing_id)->lockForUpdate()->first();
                if ($listing) {
                    $listing->decrement('quantity_reserved', min($item->quantity, $listing->quantity_reserved));
                }
            }

            // Do not instantly complete fulfillments for marketplace escrow flow!
            // The farmer still needs to deliver the goods.
            if ($payment->order_fulfillment_id) {
                $fulfillment = \App\Models\OrderFulfillment::find($payment->order_fulfillment_id);
                if ($fulfillment && in_array($fulfillment->status, ['accepted', 'pending'])) {
                    $fulfillment->update([
                        'status' => 'paid_in_escrow',
                    ]);
                }
            } else {
                foreach ($order->fulfillments as $fulfillment) {
                    if (in_array($fulfillment->status, ['accepted', 'pending'])) {
                        $fulfillment->update([
                            'status' => 'paid_in_escrow',
                        ]);
                    }
                }
            }

            // Synchronise parent order status to paid in escrow (NOT completed, delivery pending)
            $order->update([
                'status'         => Order::STATUS_PAID_IN_ESCROW,
                'payment_status' => 'paid',
            ]);

            return [
                'status'  => 'success',
                'message' => 'Payment confirmed and order completed successfully.',
            ];
        });
    }

    /**
     * Mark a payment as failed based on webhook failure.
     */
    public function failPayment(Payment $payment, array $payload): void
    {
        if ($payment->status !== 'pending') {
            return;
        }

        $payment->update([
            'status'           => 'failed',
            'gateway_metadata' => $payload,
        ]);
    }
}
