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
    public function confirmPayment(Payment $payment, array $payload = []): array
    {
        return DB::transaction(function () use ($payment, $payload) {
            $order = $payment->order;

            // Only flag late refund if the order was explicitly cancelled or expired
            if ($order->status === 'expired' || $order->status === 'cancelled') {
                $payment->update([
                    'status'           => 'failed',
                    'gateway_metadata' => array_merge($payload, ['refund_flag' => 'order_cancelled_or_expired']),
                ]);

                return [
                    'status'  => 'refund_flagged',
                    'message' => 'Payment received after order was cancelled or expired. Flagged for refund.',
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

            // Ensure 6-digit Delivery PIN is set
            $deliveryPin = $order->delivery_pin ?: str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Do not instantly complete fulfillments for marketplace escrow flow!
            // The farmer still needs to deliver the goods.
            if ($payment->order_fulfillment_id) {
                $fulfillment = \App\Models\OrderFulfillment::find($payment->order_fulfillment_id);
                if ($fulfillment && in_array($fulfillment->status, ['accepted', 'pending'])) {
                    $fulfillment->update([
                        'status'        => 'paid_in_escrow',
                        'payout_status' => 'locked',
                    ]);
                    $fulfillment->farmer->notify(new \App\Notifications\PaymentConfirmedNotification([
                        'order_number' => $order->order_number,
                        'amount' => $fulfillment->farmer_net_payout
                    ]));
                }
            } else {
                foreach ($order->fulfillments as $fulfillment) {
                    if (in_array($fulfillment->status, ['accepted', 'pending'])) {
                        $fulfillment->update([
                            'status'        => 'paid_in_escrow',
                            'payout_status' => 'locked',
                        ]);
                        $fulfillment->farmer->notify(new \App\Notifications\PaymentConfirmedNotification([
                            'order_number' => $order->order_number,
                            'amount' => $fulfillment->farmer_net_payout
                        ]));
                    }
                }
            }

            // Synchronise parent order status to paid in escrow (delivery pending)
            $oldStatus = $order->status;
            $order->update([
                'status'         => Order::STATUS_PAID_IN_ESCROW,
                'payment_status' => 'paid',
                'payout_status'  => 'locked',
                'delivery_pin'   => $deliveryPin,
            ]);

            \App\Services\AuditService::log(
                'payment.escrow_secured',
                $order,
                ['status' => $oldStatus],
                [
                    'status'         => Order::STATUS_PAID_IN_ESCROW,
                    'payment_status' => 'paid',
                    'escrow_status'  => 'held',
                    'payout_status'  => 'locked',
                    'payment_id'     => $payment->id,
                    'chapa_tx_ref'   => $payment->chapa_tx_ref,
                ]
            );

            return [
                'status'  => 'success',
                'message' => 'Payment confirmed and funds locked safely in escrow.',
                'payment' => $payment->fresh(),
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
