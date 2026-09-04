<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListOrdersRequest;
use App\Http\Resources\OrderResource;
use App\Models\CartItem;
use App\Models\Order;
use App\Services\DeliveryService;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class OrderController extends Controller
{
    public function __construct(
        protected ReservationService $reservationService = new ReservationService(),
        protected DeliveryService $deliveryService = new DeliveryService()
    ) {}

    /**
     * List the authenticated buyer's orders.
     *
     * GET /api/orders?status=pending_payment&per_page=15
     */
    public function index(ListOrdersRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validated();

        $orders = $user->orders()
            ->with(['fulfillments:id,order_id,farmer_id,status,delivery_status,inspection_status,payout_status,subtotal_amount', 'payment:id,order_id,status'])
            ->when(isset($validated['status']), function ($query) use ($validated) {
                $query->where('status', $validated['status']);
            })
            ->orderByDesc('placed_at')
            ->paginate($validated['per_page'] ?? 20);

        return OrderResource::collection($orders)->response();
    }

    /**
     * Show a single order with full details.
     *
     * GET /api/orders/{id}
     */
    public function show(int $id): JsonResponse
    {
        $order = Order::with([
            'items.listing:id,farmer_id,title,unit,harvest_date,quality_grade,minimum_order_quantity,price_valid_until,reference_market_price',
            'fulfillments.farmer:id,first_name,second_name',
            'fulfillments.items.listing:id,title,unit',
            'payment',
        ])->findOrFail($id);

        $this->authorize('view', $order);

        // Lazily check and expire reservation if past due
        if ($this->reservationService->isExpired($order) && $order->status === 'pending_payment') {
            $this->reservationService->expireReservation($order);
            $order->refresh();
        }

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Checkout: convert the buyer's cart into a new order with concurrency-safe
     * stock reservation and 15-minute expiration timer.
     *
     * POST /api/orders/checkout
     */
    public function checkout(): JsonResponse
    {
        $this->authorize('create', Order::class);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $cartItems = $user->cartItems()->with('listing')->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty.',
            ], 422);
        }

        try {
            $order = $this->reservationService->createReservation($user, $cartItems);
            
            // Clear the buyer's cart after successful order creation
            $user->cartItems()->delete();
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        $order->load([
            'items.listing:id,title,unit',
            'fulfillments.farmer:id,first_name,second_name',
            'payment:id,order_id,status',
        ]);

        return response()->json([
            'message' => 'Order placed successfully. Inventory reserved for ' . config('marketplace.reservation_duration_minutes', 15) . ' minutes.',
            'order'   => new OrderResource($order),
        ], 201);
    }

    /**
     * Verify the 6-digit delivery handoff PIN.
     *
     * POST /api/orders/{id}/verify-delivery-pin
     * Body: { "pin": "123456" }
     */
    public function verifyDeliveryPin(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:' . config('marketplace.delivery_pin_length', 6)],
        ]);

        $order = Order::findOrFail($id);

        $this->authorize('view', $order);

        try {
            $this->deliveryService->verifyHandoffPin($order, $request->input('pin'));
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Delivery PIN verified successfully. Order marked as delivered.',
            'order'   => new OrderResource($order->fresh(['fulfillments'])),
        ]);
    }

    /**
     * Cancel a pending-payment order and release reserved stock.
     *
     * POST /api/orders/{id}/cancel
     */
    public function cancel(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $this->authorize('cancel', $order);

        if ($order->status !== 'pending_payment') {
            return response()->json([
                'message' => 'Only orders with pending payment can be cancelled.',
            ], 422);
        }

        $this->reservationService->expireReservation($order);

        return response()->json([
            'message' => 'Order cancelled and reserved stock released.',
            'order'   => new OrderResource($order->fresh(['fulfillments', 'payment'])),
        ]);
    }
}

