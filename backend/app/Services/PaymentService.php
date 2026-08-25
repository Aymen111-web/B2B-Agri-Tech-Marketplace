<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Safely confirm a payment from Chapa webhook, checking for reservation expiration.
     */
    public function confirmPayment(Payment $payment, array $payload): bool
    {
        return DB::transaction(function () use ($payment, $payload) {
            $payment = Payment::where('id', $payment->id)->lockForUpdate()->first();

            if (! $payment || $payment->status !== 'pending') {
                return false;
            }

            $order = Order::where('id', $payment->order_id)->lockForUpdate()->first();

            if (! $order) {
                return false;
            }

            $reservationService = new ReservationService();

            // Handle race condition: payment arrived after reservation expired
            if ($reservationService->isExpired($order)) {
                Log::warning("Chapa webhook: Payment received for expired order {$order->order_number}. Flagging for refund.", [
                    'order_id' => $order->id,
                    'payment_id' => $payment->id,
                ]);

                $payment->update([
                    'status'           => 'failed',
                    'gateway_metadata' => array_merge($payload, ['failure_reason' => 'reservation_expired_before_payment']),
                ]);

                $order->update([
                    'payment_status' => 'failed',
                ]);

                return false;
            }

            // Payment succeeds within reservation window
            $payment->update([
                'status'           => 'confirmed',
                'confirmed_at'     => now(),
                'gateway_metadata' => $payload,
            ]);

            $order->update([
                'status'         => 'payment_confirmed',
                'payment_status' => 'confirmed',
            ]);

            return true;
        });
    }
}
