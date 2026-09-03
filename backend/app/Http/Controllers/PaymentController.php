<?php

namespace App\Http\Controllers;

use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Initiate payment for a pending order via Chapa hosted checkout.
     *
     * POST /api/orders/{id}/pay
     *
     * Creates a Payment record, calls Chapa's transaction/initialize endpoint,
     * and returns the hosted checkout URL so the buyer can complete payment.
     * The payment status will transition from "pending" to "confirmed" ONLY
     * through the signed Chapa webhook — never from this controller.
     */
    public function initiate(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $this->authorize('initiate', $order);

        if ($order->status !== 'pending_payment') {
            return response()->json([
                'message' => 'This order is not awaiting payment.',
            ], 422);
        }

        // Prevent duplicate payment initiation.
        $existingPayment = Payment::where('order_id', $order->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->first();

        if ($existingPayment) {
            // If there is already a pending payment with a checkout URL, return it.
            if ($existingPayment->status === 'pending' && $existingPayment->chapa_checkout_url) {
                return response()->json([
                    'message'      => 'Payment already initiated.',
                    'checkout_url' => $existingPayment->chapa_checkout_url,
                    'payment'      => new PaymentResource($existingPayment),
                ]);
            }

            if ($existingPayment->status === 'confirmed') {
                return response()->json([
                    'message' => 'Payment has already been confirmed for this order.',
                ], 422);
            }
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Generate a unique transaction reference for Chapa.
        $txRef = 'TX-' . $order->order_number . '-' . strtoupper(Str::random(6));

        // Build the Chapa initialization payload.
        $chapaPayload = [
            'amount'       => (float) $order->total_amount,
            'currency'     => $order->currency,
            'tx_ref'       => $txRef,
            'callback_url' => config('services.chapa.callback_url'),
            'return_url'   => config('services.chapa.return_url'),
            'first_name'   => $user->first_name,
            'last_name'    => $user->second_name,
            'phone_number' => $user->phone,
            'customization' => [
                'title'       => 'Ethiopian Farmers Market',
                'description' => "Payment for order {$order->order_number}",
            ],
        ];

        try {
            $response = Http::withToken(config('services.chapa.secret_key'))
                ->post('https://api.chapa.co/v1/transaction/initialize', $chapaPayload);

            if (! $response->successful()) {
                return response()->json([
                    'message' => 'Unable to initiate payment with the payment gateway. Please try again.',
                ], 502);
            }

            $chapaData   = $response->json('data');
            $checkoutUrl = $chapaData['checkout_url'] ?? null;

            if (! $checkoutUrl) {
                return response()->json([
                    'message' => 'Payment gateway returned an unexpected response. Please try again.',
                ], 502);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Unable to reach the payment gateway. Please try again later.',
            ], 503);
        }

        // Create the payment record (status starts as "pending").
        $payment = Payment::create([
            'order_id'           => $order->id,
            'chapa_tx_ref'       => $txRef,
            'chapa_checkout_url' => $checkoutUrl,
            'amount'             => $order->total_amount,
            'currency'           => $order->currency,
            'status'             => 'pending',
        ]);

        return response()->json([
            'message'      => 'Payment initiated. Redirect the buyer to the checkout URL.',
            'checkout_url' => $checkoutUrl,
            'payment'      => new PaymentResource($payment),
        ], 201);
    }

    /**
     * Initiate direct settlement payment for a specific order fulfillment to farmer subaccount.
     *
     * POST /api/fulfillments/{id}/pay
     */
    public function initiateFulfillmentPayment(int $fulfillmentId, \App\Services\ChapaService $chapaService): JsonResponse
    {
        $fulfillment = \App\Models\OrderFulfillment::with(['order', 'farmer'])->findOrFail($fulfillmentId);

        /** @var \App\Models\User $buyer */
        $buyer = Auth::user();

        if ($fulfillment->order->buyer_id !== $buyer->id) {
            return response()->json(['message' => 'Unauthorized payment attempt.'], 403);
        }

        if ($fulfillment->status !== 'buyer_received') {
            return response()->json([
                'message' => 'Payment can only be initiated after physical inspection and confirming produce receipt.',
            ], 422);
        }

        $farmer = $fulfillment->farmer;

        if (! $farmer || ! $farmer->chapa_subaccount_id) {
            return response()->json([
                'message' => 'The farmer has not set up their payment subaccount destination yet.',
            ], 422);
        }

        // Check existing pending or confirmed payment for this fulfillment
        $existingPayment = Payment::where('order_fulfillment_id', $fulfillment->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->first();

        if ($existingPayment) {
            if ($existingPayment->status === 'pending' && $existingPayment->chapa_checkout_url) {
                return response()->json([
                    'message'      => 'Payment already initiated.',
                    'checkout_url' => $existingPayment->chapa_checkout_url,
                    'payment'      => new PaymentResource($existingPayment),
                ]);
            }

            if ($existingPayment->status === 'confirmed') {
                return response()->json([
                    'message' => 'Payment has already been confirmed for this fulfillment.',
                ], 422);
            }
        }

        $txRef = 'TX-FULFILL-' . $fulfillment->id . '-' . strtoupper(Str::random(6));

        $res = $chapaService->initializeDirectPayment($fulfillment, $buyer, $farmer, $txRef);

        if (! $res['success'] || empty($res['checkout_url'])) {
            return response()->json([
                'message' => 'Unable to initiate direct payment with payment gateway.',
            ], 502);
        }

        $payment = Payment::create([
            'order_id'             => $fulfillment->order_id,
            'order_fulfillment_id' => $fulfillment->id,
            'chapa_tx_ref'         => $txRef,
            'chapa_checkout_url'   => $res['checkout_url'],
            'amount'               => $fulfillment->subtotal_amount,
            'currency'             => 'ETB',
            'status'               => 'pending',
        ]);

        return response()->json([
            'message'      => 'Direct payment initiated. Redirecting to Chapa checkout.',
            'checkout_url' => $res['checkout_url'],
            'payment'      => new PaymentResource($payment),
        ], 201);
    }

    /**
     * Show the payment details for a specific order.
     *
     * GET /api/orders/{id}/payment
     */
    public function show(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $this->authorize('view', $order);

        $payment = Payment::where('order_id', $order->id)->first();

        if (! $payment) {
            return response()->json([
                'message' => 'No payment has been initiated for this order.',
            ], 404);
        }

        return response()->json([
            'payment' => new PaymentResource($payment),
        ]);
    }
}
