<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListFulfillmentsRequest;
use App\Http\Requests\RejectFulfillmentRequest;
use App\Http\Resources\OrderFulfillmentResource;
use App\Models\Listing;
use App\Models\Order;
use App\Models\OrderFulfillment;
use App\Services\InspectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class OrderFulfillmentController extends Controller
{
    public function __construct(
        protected InspectionService $inspectionService = new InspectionService()
    ) {}

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
                'order:id,order_number,buyer_id,status,delivery_status,inspection_status,payout_status,total_amount,currency,placed_at',
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
            'order:id,order_number,buyer_id,status,delivery_status,inspection_status,payout_status,total_amount,currency,placed_at',
            'order.buyer:id,first_name,second_name',
            'items.listing:id,title,unit,price_per_unit',
        ])->findOrFail($id);

        $this->authorize('view', $fulfillment);

        return response()->json([
            'fulfillment' => new OrderFulfillmentResource($fulfillment),
        ]);
    }

    /**
     * Complete produce inspection for a fulfillment (Buyer).
     *
     * POST /api/fulfillments/{id}/inspect
     * Body: { "inspection_status": "accepted|partially_accepted|rejected", "accepted_quantity": 85, "rejected_quantity": 15, "inspection_notes": "..." }
     */
    public function inspect(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'inspection_status' => ['required', 'string', 'in:accepted,partially_accepted,rejected'],
            'accepted_quantity' => ['nullable', 'numeric', 'min:0'],
            'rejected_quantity' => ['nullable', 'numeric', 'min:0'],
            'inspection_notes'   => ['nullable', 'string', 'max:1000'],
        ]);

        $fulfillment = OrderFulfillment::findOrFail($id);

        // Authorize buyer to inspect their order's fulfillments
        $order = $fulfillment->order;
        if (! $order || $order->buyer_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized to inspect this fulfillment.'], 403);
        }

        try {
            $updatedFulfillment = $this->inspectionService->completeInspection(
                $fulfillment,
                $request->input('inspection_status'),
                $request->input('accepted_quantity'),
                $request->input('rejected_quantity'),
                $request->input('inspection_notes')
            );
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message'     => 'Produce inspection recorded successfully.',
            'fulfillment' => new OrderFulfillmentResource($updatedFulfillment->fresh(['order', 'items.listing'])),
        ]);
    }

    /**
     * Accept a pending fulfillment.
     *
     * POST /api/fulfillments/{id}/accept
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
                'status'          => 'completed',
                'delivery_status' => 'delivered',
                'completed_at'    => now(),
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
     * Synchronise the parent order's aggregate status based on the current
     * state of all its fulfillments.
     */
    private function syncOrderStatus(int $orderId): void
    {
        $order = Order::findOrFail($orderId);

        if (in_array($order->status, ['pending_payment', 'cancelled'], true)) {
            return;
        }

        $statuses = $order->fulfillments()->pluck('status');

        if ($statuses->isEmpty()) {
            return;
        }

        $allCompleted = $statuses->every(fn ($s) => $s === 'completed');
        $allRejected  = $statuses->every(fn ($s) => $s === 'rejected');
        $hasPending   = $statuses->contains('pending');

        if ($allCompleted) {
            $order->update(['status' => 'completed']);
        } elseif ($allRejected) {
            $order->update(['status' => 'cancelled']);
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
}

