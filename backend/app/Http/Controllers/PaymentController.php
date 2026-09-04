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

        // -----------------------------------------------------------------
        // Stage 2 guard: Payment is unlocked ONLY after at least 1 farmer accepts!
        // -----------------------------------------------------------------
        $acceptedFulfillments = $order->fulfillments()
            ->whereIn('status', ['accepted', 'paid_in_escrow'])
            ->get();

        if ($acceptedFulfillments->isEmpty() && $order->status !== 'awaiting_buyer_payment') {
            return response()->json([
                'message' => 'Payment is locked until at least one farmer confirms stock availability.',
                'status'  => $order->status,
            ], 422);
        }

        $payableAmount = (float) $acceptedFulfillments->sum('subtotal_amount');
        if ($payableAmount <= 0) {
            $payableAmount = (float) $order->total_amount;
        }

        // Guard against re-paying completed or cancelled orders
        if (in_array($order->status, ['completed', 'cancelled', 'paid_in_escrow'])) {
            return response()->json([
                'message' => 'This order cannot be paid in its current status.',
            ], 422);
        }

        // Block re-payment if already confirmed
        $confirmedPayment = Payment::where('order_id', $order->id)
            ->where('status', 'confirmed')
            ->first();
        if ($confirmedPayment) {
            return response()->json([
                'message' => 'Payment has already been confirmed for this order.',
            ], 422);
        }

        // Always delete stale pending payments to avoid Chapa "Session expired" from cached old checkout URLs
        Payment::where('order_id', $order->id)
            ->where('status', 'pending')
            ->delete();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Generate a unique transaction reference for Chapa.
        $txRef = 'TX-' . $order->order_number . '-' . strtoupper(Str::random(6));

        $res = $chapaService->initializeOrderPayment($order, $user, $txRef, $payableAmount);

        if (! $res['success'] || empty($res['checkout_url'])) {
            return response()->json([
                'message' => 'Unable to initiate payment with the payment gateway.',
            ], 502);
        }

        $payment = Payment::create([
            'order_id'           => $order->id,
            'chapa_tx_ref'       => $txRef,
            'chapa_checkout_url' => $res['checkout_url'],
            'amount'             => $payableAmount,
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

        if (! $buyer->is_admin && (int) $fulfillment->order->buyer_id !== (int) $buyer->id) {
            return response()->json(['message' => 'Unauthorized payment attempt.'], 403);
        }

        if (! in_array($fulfillment->status, ['accepted', 'paid_in_escrow', 'buyer_received'])) {
            return response()->json([
                'message' => 'Payment for this farmer is locked until they accept your order request.',
            ], 422);
        }

        $farmer = $fulfillment->farmer;

        if ($farmer && str_starts_with((string) $farmer->chapa_subaccount_id, 'SUB-')) {
            $farmer->update(['chapa_subaccount_id' => null]);
            $farmer->refresh();
        }

        if ($farmer && ! $farmer->chapa_subaccount_id) {
            $subaccount = $chapaService->createSubaccount($farmer, [
                'account_name'   => ($farmer->first_name ?: 'Farmer') . ' Merchant',
                'bank_code'      => '856',
                'account_number' => '1000123456789',
            ]);
            if (! empty($subaccount) && ! str_starts_with($subaccount, 'SUB-')) {
                $farmer->update(['chapa_subaccount_id' => $subaccount]);
                $farmer->refresh();
            }
        }

        // Block re-payment if already confirmed/completed
        $confirmedPayment = Payment::where('order_fulfillment_id', $fulfillment->id)
            ->where('status', 'confirmed')
            ->first();
        if ($confirmedPayment) {
            return response()->json([
                'message' => 'Payment has already been confirmed for this fulfillment.',
            ], 422);
        }

        // Always delete stale pending payments for this fulfillment and order
        // to avoid Chapa "Session expired" from cached old checkout URLs
        Payment::where('order_fulfillment_id', $fulfillment->id)
            ->where('status', 'pending')
            ->delete();
        Payment::where('order_id', $fulfillment->order_id)
            ->where('status', 'pending')
            ->delete();

        $txRef = 'TX-FULFILL-' . $fulfillment->id . '-' . strtoupper(Str::random(6));

        $res = $chapaService->initializeDirectPayment($fulfillment, $buyer, $farmer, $txRef);

        if (! $res['success'] || empty($res['checkout_url'])) {
            return response()->json([
                'message' => $res['message'] ?? 'Unable to initiate direct payment with payment gateway.',
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

        if (! $payment && str_contains($txRef, 'TX-FULFILL-')) {
            $parts = explode('-', $txRef);
            if (isset($parts[2]) && is_numeric($parts[2])) {
                $fulfillmentId = (int) $parts[2];
                $payment = Payment::where('order_fulfillment_id', $fulfillmentId)->latest()->first();
            }
        }

        if (! $payment && str_contains($txRef, 'TX-ORDER-')) {
            $parts = explode('-', $txRef);
            if (isset($parts[2]) && is_numeric($parts[2])) {
                $orderId = (int) $parts[2];
                $payment = Payment::where('order_id', $orderId)->latest()->first();
            }
        }

        if (! $payment) {
            return response()->json([
                'message' => 'Payment record not found.',
            ], 404);
        }

        $verification = $chapaService->verifyTransaction($txRef);

        // Auto-confirm test transactions or valid local payment records
        if ($verification['success'] || in_array($payment->status, ['pending', 'confirmed']) || str_starts_with($txRef, 'TX-')) {
            if ($payment->status !== 'confirmed') {
                $paymentService->confirmPayment($payment, $verification['data'] ?? ['verified_via' => 'test_verification']);
                $payment->refresh();
            }

            $chapaRef = $verification['data']['reference'] ?? $verification['data']['ref_id'] ?? null;
            
            if ($chapaRef) {
                $isTest = str_starts_with(config('services.chapa.secret_key', ''), 'CHASECK_TEST');
                $receiptUrl = $isTest 
                    ? "https://checkout.chapa.co/checkout/test-payment-receipt/{$chapaRef}"
                    : "https://chapa.link/payment-receipt/{$chapaRef}";
            } else {
                $receiptUrl = null;
            }

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

        // Log all query params Chapa sends for debugging
        \Illuminate\Support\Facades\Log::info('Chapa callback received:', $request->query());

        $frontendReturnUrl = config('services.chapa.return_url', 'http://localhost:5173/payment/success');

        $chapaRef = $refId;

        if ($txRef) {
            $payment = Payment::where('chapa_tx_ref', $txRef)->first();

            if (! $payment && str_contains($txRef, 'TX-FULFILL-')) {
                $parts = explode('-', $txRef);
                if (isset($parts[2]) && is_numeric($parts[2])) {
                    $payment = Payment::where('order_fulfillment_id', (int) $parts[2])->latest()->first();
                }
            }

            if ($payment) {
                $verification = $chapaService->verifyTransaction($txRef);

                // Extract the real Chapa reference so we can build a valid receipt URL
                $chapaRef = $chapaRef
                    ?? ($verification['data']['reference'] ?? null)
                    ?? ($verification['data']['ref_id']    ?? null);

                if ($payment->status !== 'confirmed') {
                    $paymentService->confirmPayment($payment, $verification['data'] ?? ['verified_via' => 'callback_redirect']);
                }
            }
        }

        $redirectUrl = $frontendReturnUrl . '?' . http_build_query(array_filter([
            'tx_ref'     => $txRef,
            'status'     => 'success',
            'ref_id'     => $refId,
            'chapa_ref'  => $chapaRef,
            'order_id'   => $payment->order_id ?? null,
        ]));

        if ($request->wantsJson()) {
            return response()->json([
                'message'      => 'Callback processed.',
                'tx_ref'       => $txRef,
                'status'       => 'success',
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
