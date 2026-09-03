<?php

namespace App\Http\Controllers;

use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Services\ChapaService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Initiate payment for a pending order via Chapa hosted checkout.
     *
     * POST /api/orders/{id}/pay
     */
    public function initiate(int $id, ChapaService $chapaService): JsonResponse
    {
        $order = Order::with('items.listing')->findOrFail($id);

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

        $res = $chapaService->initializeOrderPayment($order, $user, $txRef);

        if (! $res['success'] || empty($res['checkout_url'])) {
            return response()->json([
                'message' => 'Unable to initiate payment with the payment gateway.',
            ], 502);
        }

        $payment = Payment::create([
            'order_id'           => $order->id,
            'chapa_tx_ref'       => $txRef,
            'chapa_checkout_url' => $res['checkout_url'],
            'amount'             => $order->total_amount,
            'currency'           => $order->currency ?: 'ETB',
            'status'             => 'pending',
        ]);

        return response()->json([
            'message'      => 'Payment initiated. Redirect the buyer to the checkout URL.',
            'checkout_url' => $res['checkout_url'],
            'payment'      => new PaymentResource($payment),
        ], 201);
    }

    /**
     * Initiate direct settlement payment for a specific order fulfillment to farmer subaccount.
     *
     * POST /api/fulfillments/{id}/pay
     */
    public function initiateFulfillmentPayment(int $fulfillmentId, ChapaService $chapaService): JsonResponse
    {
        $fulfillment = \App\Models\OrderFulfillment::with(['order.items.listing', 'farmer'])->findOrFail($fulfillmentId);

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
     * Verify payment status directly with Chapa API.
     *
     * GET /api/payments/verify/{txRef}
     */
    public function verify(string $txRef, ChapaService $chapaService, PaymentService $paymentService): JsonResponse
    {
        $payment = Payment::where('chapa_tx_ref', $txRef)->first();

        if (! $payment) {
            return response()->json([
                'message' => 'Payment record not found.',
            ], 404);
        }

        $verification = $chapaService->verifyTransaction($txRef);

        if ($verification['success']) {
            if ($payment->status !== 'confirmed') {
                $paymentService->confirmPayment($payment, $verification['data'] ?? []);
                $payment->refresh();
            }

            $chapaRef = $verification['data']['reference'] ?? $verification['data']['ref_id'] ?? null;
            $receiptUrl = $chapaRef ? "https://chapa.link/payment-receipt/{$chapaRef}" : null;

            return response()->json([
                'message'      => 'Payment verified successfully.',
                'status'       => 'success',
                'payment'      => new PaymentResource($payment),
                'chapa_data'   => $verification['data'] ?? [],
                'receipt_url'  => $receiptUrl,
            ]);
        }

        return response()->json([
            'message'    => $verification['message'] ?? 'Payment verification pending or failed.',
            'status'     => $verification['status'] ?? 'failed',
            'payment'    => new PaymentResource($payment),
            'chapa_data' => $verification['data'] ?? [],
        ], 400);
    }

    /**
     * Handle Chapa callback GET redirect after customer payment completes.
     *
     * GET /api/payments/callback
     */
    public function callback(Request $request, ChapaService $chapaService, PaymentService $paymentService): RedirectResponse|JsonResponse
    {
        $txRef  = $request->query('trx_ref') ?? $request->query('tx_ref');
        $status = $request->query('status');
        $refId  = $request->query('ref_id');

        $frontendReturnUrl = config('services.chapa.return_url', 'http://localhost:5173/payment/success');

        if ($txRef) {
            $payment = Payment::where('chapa_tx_ref', $txRef)->first();

            if ($payment) {
                // Verify with Chapa server
                $verification = $chapaService->verifyTransaction($txRef);

                if ($verification['success']) {
                    if ($payment->status !== 'confirmed') {
                        $paymentService->confirmPayment($payment, $verification['data'] ?? []);
                    }
                }
            }
        }

        $redirectUrl = $frontendReturnUrl . '?' . http_build_query([
            'tx_ref' => $txRef,
            'status' => $status ?? 'success',
            'ref_id' => $refId,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message'      => 'Callback processed.',
                'tx_ref'       => $txRef,
                'status'       => $status,
                'redirect_url' => $redirectUrl,
            ]);
        }

        return redirect()->away($redirectUrl);
    }

    /**
     * Cancel an active Chapa transaction.
     *
     * POST /api/payments/cancel/{txRef}
     */
    public function cancel(string $txRef, ChapaService $chapaService): JsonResponse
    {
        $payment = Payment::where('chapa_tx_ref', $txRef)->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment reference not found.'], 404);
        }

        if ($payment->status === 'confirmed') {
            return response()->json(['message' => 'Cannot cancel a confirmed payment.'], 422);
        }

        $res = $chapaService->cancelTransaction($txRef);

        if ($res['success']) {
            $payment->update(['status' => 'failed']);

            return response()->json([
                'message' => 'Transaction cancelled successfully.',
                'payment' => new PaymentResource($payment),
            ]);
        }

        return response()->json([
            'message' => $res['message'] ?? 'Failed to cancel transaction.',
        ], 400);
    }

    /**
     * Get list of supported currencies from Chapa.
     *
     * GET /api/payments/currencies
     */
    public function currencies(ChapaService $chapaService): JsonResponse
    {
        $data = $chapaService->getSupportedCurrencies();

        return response()->json($data);
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
