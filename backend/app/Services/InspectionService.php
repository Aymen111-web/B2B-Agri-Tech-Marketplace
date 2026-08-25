<?php

namespace App\Services;

use App\Models\Listing;
use App\Models\Order;
use App\Models\OrderFulfillment;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class InspectionService
{
    /**
     * Complete the buyer produce inspection for a fulfillment.
     */
    public function completeInspection(
        OrderFulfillment $fulfillment,
        string $inspectionStatus,
        ?float $acceptedQty = null,
        ?float $rejectedQty = null,
        ?string $notes = null
    ): OrderFulfillment {
        $allowed = ['accepted', 'partially_accepted', 'rejected'];

        if (! in_array($inspectionStatus, $allowed, true)) {
            throw new InvalidArgumentException("Invalid inspection status. Must be one of: " . implode(', ', $allowed));
        }

        return DB::transaction(function () use ($fulfillment, $inspectionStatus, $acceptedQty, $rejectedQty, $notes) {
            $fulfillment = OrderFulfillment::where('id', $fulfillment->id)->lockForUpdate()->first();

            $fulfillment->update([
                'inspection_status' => $inspectionStatus,
                'accepted_quantity' => $acceptedQty,
                'rejected_quantity' => $rejectedQty,
                'inspection_notes'   => $notes,
                'inspected_at'       => now(),
            ]);

            // Handle stock adjustment based on inspection
            $items = $fulfillment->items()->get();

            foreach ($items as $item) {
                $listing = Listing::where('id', $item->listing_id)->lockForUpdate()->first();

                if ($listing) {
                    if ($inspectionStatus === 'accepted') {
                        // All reserved stock consumed
                        $listing->decrement('quantity_reserved', (float) $item->quantity);
                    } elseif ($inspectionStatus === 'rejected') {
                        // Return rejected stock to available
                        $listing->decrement('quantity_reserved', (float) $item->quantity);
                        $listing->increment('quantity_available', (float) $item->quantity);
                    } elseif ($inspectionStatus === 'partially_accepted') {
                        // Accepted portion consumed, rejected portion returned to available
                        $rej = $rejectedQty ?? 0;
                        $listing->decrement('quantity_reserved', (float) $item->quantity);
                        if ($rej > 0) {
                            $listing->increment('quantity_available', (float) $rej);
                        }
                    }
                }
            }

            // Calculate payout eligibility
            $payoutStatus = $this->calculatePayoutEligibility($fulfillment);

            $fulfillment->update([
                'payout_status' => $payoutStatus,
                'status'        => $inspectionStatus === 'rejected' ? 'rejected' : 'completed',
            ]);

            // Sync parent order aggregate inspection & payout status
            $this->syncOrderInspectionAndPayoutStatus($fulfillment->order_id);

            return $fulfillment->fresh();
        });
    }

    /**
     * Calculate payout eligibility for a fulfillment.
     * Payout becomes eligible ONLY IF:
     * - Payment is confirmed
     * - Delivery is delivered & PIN verified
     * - Inspection is accepted (or partially_accepted)
     */
    public function calculatePayoutEligibility(OrderFulfillment $fulfillment): string
    {
        $order = $fulfillment->order;

        if (! $order) {
            return 'pending';
        }

        $paymentConfirmed = ($order->payment_status === 'confirmed');
        $deliveryVerified = ($order->delivery_status === 'delivered' && $order->delivery_pin_verified_at !== null);
        $inspectionDone   = in_array($fulfillment->inspection_status, ['accepted', 'partially_accepted'], true);

        if ($fulfillment->inspection_status === 'rejected' || $fulfillment->inspection_status === 'partially_accepted') {
            return 'flagged'; // Requires admin review
        }

        if ($paymentConfirmed && $deliveryVerified && $inspectionDone) {
            return 'eligible';
        }

        return 'pending';
    }

    /**
     * Sync aggregate order inspection and payout status.
     */
    private function syncOrderInspectionAndPayoutStatus(int $orderId): void
    {
        $order = Order::find($orderId);
        if (! $order) {
            return;
        }

        $fulfillments = $order->fulfillments()->get();

        $allAccepted  = $fulfillments->every(fn ($f) => $f->inspection_status === 'accepted');
        $hasFlagged   = $fulfillments->contains(fn ($f) => $f->payout_status === 'flagged');
        $allEligible  = $fulfillments->every(fn ($f) => $f->payout_status === 'eligible');

        $orderInspectionStatus = $allAccepted ? 'accepted' : 'partially_accepted';
        $orderPayoutStatus     = $hasFlagged ? 'flagged' : ($allEligible ? 'eligible' : 'pending');

        $order->update([
            'inspection_status' => $orderInspectionStatus,
            'payout_status'     => $orderPayoutStatus,
        ]);
    }
}
