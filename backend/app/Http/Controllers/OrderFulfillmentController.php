<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListFulfillmentsRequest;
use App\Http\Requests\RejectFulfillmentRequest;
use App\Http\Resources\OrderFulfillmentResource;
use App\Models\Listing;
use App\Models\Order;
use App\Models\OrderFulfillment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderFulfillmentController extends Controller
{
    /**
     * List all fulfillments assigned to the authenticated farmer.
     *
     * GET /api/fulfillments?status=pending&per_page=15
     */
    public function index(ListFulfillmentsRequest $request): JsonResponse
    {
        $this->authorize('viewAny', OrderFulfillment::class);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validated();

        $fulfillments = $user->orderFulfillments()
            ->with([
                'order:id,order_number,buyer_id,status,total_amount,currency,placed_at',
                'order.buyer:id,first_name,second_name',
                'items.listing:id,title,unit',
            ])
            ->when(isset($validated['status']), function ($query) use ($validated) {
                $query->where('status', $validated['status']);
            })
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return OrderFulfillmentResource::collection($fulfillments)->response();
    }

    /**
     * Show a single fulfillment with full details.
     *
     * GET /api/fulfillments/{id}
     */
    public function show(int $id): JsonResponse
    {
        $fulfillment = OrderFulfillment::with([
            'order:id,order_number,buyer_id,status,total_amount,currency,placed_at',
            'order.buyer:id,first_name,second_name',
            'items.listing:id,title,unit,price_per_unit',
        ])->findOrFail($id);

        $this->authorize('view', $fulfillment);

        return response()->json([
            'fulfillment' => new OrderFulfillmentResource($fulfillment),
        ]);
    }

    /**
     * Accept a pending fulfillment.
     *
     * POST /api/fulfillments/{id}/accept
     *
     * The farmer confirms they can fulfill their portion of the order.
     */
    public function accept(int $id): JsonResponse
    {
        $fulfillment = OrderFulfillment::findOrFail($id);

        $this->authorize('accept', $fulfillment);

        if ($fulfillment->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending fulfillments can be accepted.',
            ], 422);
        }

        $fulfillment->update([
            'status'      => 'accepted',
            'accepted_at' => now(),
        ]);

        $this->syncOrderStatus($fulfillment->order_id);

        return response()->json([
            'message'     => 'Fulfillment accepted.',
            'fulfillment' => new OrderFulfillmentResource($fulfillment->fresh([
                'order', 'items.listing',
            ])),
        ]);
    }

    /**
     * Reject a pending fulfillment and release the reserved stock.
     *
     * POST /api/fulfillments/{id}/reject
     * Body: { "farmer_notes": "Out of stock due to weather damage." }
     *
     * When a farmer rejects a fulfillment the reserved quantities for their
     * items are returned to available stock.
     */
    public function reject(RejectFulfillmentRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();

        $fulfillment = OrderFulfillment::findOrFail($id);

        $this->authorize('reject', $fulfillment);

        if ($fulfillment->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending fulfillments can be rejected.',
            ], 422);
        }

        DB::transaction(function () use ($fulfillment, $validated) {
            // Release reserved stock for every item in this fulfillment.
            $items = $fulfillment->items()->get();

            foreach ($items as $item) {
                $listing = Listing::where('id', $item->listing_id)
                    ->lockForUpdate()
                    ->first();

                if ($listing) {
                    $listing->increment('quantity_available', (float) $item->quantity);
                    $listing->decrement('quantity_reserved', (float) $item->quantity);
                }
            }

            $fulfillment->update([
                'status'       => 'rejected',
                'farmer_notes' => $validated['farmer_notes'] ?? null,
                'rejected_at'  => now(),
            ]);
        });

        $this->syncOrderStatus($fulfillment->order_id);

        return response()->json([
            'message'     => 'Fulfillment rejected and reserved stock released.',
            'fulfillment' => new OrderFulfillmentResource($fulfillment->fresh([
                'order', 'items.listing',
            ])),
        ]);
    }

    /**
     * Mark an accepted fulfillment as completed (handoff done).
     *
     * POST /api/fulfillments/{id}/complete
     *
     * The farmer confirms the produce has been handed off to the buyer.
     * Reserved stock is consumed (decremented from quantity_reserved).
     */
    public function complete(int $id): JsonResponse
    {
        $fulfillment = OrderFulfillment::findOrFail($id);

        $this->authorize('complete', $fulfillment);

        if ($fulfillment->status !== 'accepted') {
            return response()->json([
                'message' => 'Only accepted fulfillments can be marked as completed.',
            ], 422);
        }

        DB::transaction(function () use ($fulfillment) {
            // Consume the reserved stock — the produce has been handed off.
            $items = $fulfillment->items()->get();

            foreach ($items as $item) {
                $listing = Listing::where('id', $item->listing_id)
                    ->lockForUpdate()
                    ->first();

                if ($listing) {
                    $listing->decrement('quantity_reserved', (float) $item->quantity);
                }
            }

            $fulfillment->update([
                'status'       => 'completed',
                'completed_at' => now(),
            ]);
        });

        $this->syncOrderStatus($fulfillment->order_id);

        return response()->json([
            'message'     => 'Fulfillment completed.',
            'fulfillment' => new OrderFulfillmentResource($fulfillment->fresh([
                'order', 'items.listing',
            ])),
        ]);
    }

    /**
     * Confirm physical receipt of produce by the buyer.
     *
     * POST /api/fulfillments/{id}/confirm-received
     *
     * The buyer confirms physical inspection & handoff.
     * Status transitions to 'buyer_received', enabling the direct settlement "Pay Farmer" button.
     */
    public function confirmReceived(int $id): JsonResponse
    {
        $fulfillment = OrderFulfillment::findOrFail($id);

        $this->authorize('confirmReceived', $fulfillment);

        if ($fulfillment->status !== 'accepted') {
            return response()->json([
                'message' => 'Only accepted fulfillments can be marked as received by the buyer.',
            ], 422);
        }

        $fulfillment->update([
            'status' => 'buyer_received',
        ]);

        $this->syncOrderStatus($fulfillment->order_id);

        return response()->json([
            'message'     => 'Produce inspection confirmed! You can now proceed to pay the farmer.',
            'fulfillment' => new OrderFulfillmentResource($fulfillment->fresh([
                'order', 'items.listing', 'farmer',
            ])),
        ]);
    }

    /**
     * Synchronise the parent order's aggregate status based on the current
     * state of all its fulfillments.
     */
    private function syncOrderStatus(int $orderId): void
    {
        $order = Order::findOrFail($orderId);

        if ($order->status === 'cancelled') {
            return;
        }

        $statuses = $order->fulfillments()->pluck('status');

        if ($statuses->isEmpty()) {
            return;
        }

        $allCompleted     = $statuses->every(fn ($s) => $s === 'completed');
        $allRejected      = $statuses->every(fn ($s) => $s === 'rejected');
        $hasPending       = $statuses->contains('pending');
        $hasBuyerReceived = $statuses->contains('buyer_received');

        if ($allCompleted) {
            $order->update(['status' => 'completed']);
        } elseif ($allRejected) {
            $order->update(['status' => 'cancelled']);
        } elseif ($hasBuyerReceived) {
            $order->update(['status' => 'processing']);
        } elseif (! $hasPending) {
            $hasCompleted = $statuses->contains('completed');
            $hasRejected  = $statuses->contains('rejected');

            if ($hasCompleted && $hasRejected) {
                $order->update(['status' => 'partially_fulfilled']);
            } else {
                $order->update(['status' => 'processing']);
            }
        }
    }

    /**
     * Check whether the given user has an active farmer capability.
     */
    private function hasActiveFarmerCapability(\App\Models\User $user): bool
    {
        return $user->capabilities()
            ->where('capability_type', 'farmer')
            ->where('status', 'active')
            ->exists();
    }
}
