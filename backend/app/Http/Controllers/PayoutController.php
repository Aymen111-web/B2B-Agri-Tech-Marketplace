<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListPayoutsRequest;
use App\Http\Requests\MonthlyPayoutReportRequest;
use App\Http\Requests\StorePayoutRequest;
use App\Http\Requests\UpdatePayoutStatusRequest;
use App\Http\Resources\PayoutResource;
use App\Models\Payout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PayoutController extends Controller
{
    /**
     * List payouts for the authenticated farmer.
     *
     * GET /api/payouts
     */
    public function index(ListPayoutsRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validated();

        $payouts = Payout::with(['fulfillment.order', 'fulfillment.items.listing'])
            ->where('farmer_id', $user->id)
            ->when(isset($validated['status']), function ($query) use ($validated) {
                $query->where('status', $validated['status']);
            })
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return PayoutResource::collection($payouts)->response();
    }

    /**
     * Get summary metrics of payouts for the authenticated farmer.
     *
     * GET /api/payouts/summary
     */
    public function summary(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $totalPaidOut = (float) Payout::where('farmer_id', $user->id)
            ->where('status', 'processed')
            ->sum('amount');

        $pendingEscrow = (float) Payout::where('farmer_id', $user->id)
            ->where('status', 'pending')
            ->sum('amount');

        $recentPayoutsCount = Payout::where('farmer_id', $user->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        return response()->json([
            'summary' => [
                'total_paid_out'        => $totalPaidOut,
                'pending_escrow_amount' => $pendingEscrow,
                'recent_payouts_count'  => $recentPayoutsCount,
                'currency'              => 'ETB',
            ],
        ]);
    }

    /**
     * Get pending payouts for the authenticated farmer.
     *
     * GET /api/payouts/pending
     */
    public function pending(ListPayoutsRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $payouts = Payout::with(['fulfillment.order'])
            ->where('farmer_id', $user->id)
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 20));

        return PayoutResource::collection($payouts)->response();
    }

    /**
     * Get processed payouts for the authenticated farmer.
     *
     * GET /api/payouts/processed
     */
    public function processed(ListPayoutsRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $payouts = Payout::with(['fulfillment.order'])
            ->where('farmer_id', $user->id)
            ->where('status', 'processed')
            ->orderByDesc('processed_at')
            ->paginate($request->input('per_page', 20));

        return PayoutResource::collection($payouts)->response();
    }

    /**
     * Generate monthly payout report.
     *
     * GET /api/payouts/monthly-report
     */
    public function monthlyReport(MonthlyPayoutReportRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validated();
        $year = $validated['year'] ?? (int) date('Y');
        $month = $validated['month'] ?? (int) date('m');

        $payouts = Payout::where('farmer_id', $user->id)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->get();

        $totalAmount = (float) $payouts->where('status', 'processed')->sum('amount');

        return response()->json([
            'year'         => $year,
            'month'        => $month,
            'total_amount' => $totalAmount,
            'count'        => $payouts->count(),
            'payouts'      => PayoutResource::collection($payouts),
        ]);
    }

    /**
     * Show details of a specific payout.
     *
     * GET /api/payouts/{id}
     */
    public function show(int $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $payout = Payout::with(['farmer', 'fulfillment.order.buyer'])->findOrFail($id);

        if (! $user->is_admin && (int) $payout->farmer_id !== (int) $user->id) {
            return response()->json(['message' => 'Unauthorized to view this payout.'], 403);
        }

        return response()->json([
            'payout' => new PayoutResource($payout),
        ]);
    }

    /**
     * Admin: List payout history across the platform.
     *
     * GET /api/admin/payouts
     */
    public function history(ListPayoutsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $payouts = Payout::with(['farmer', 'fulfillment.order'])
            ->when(isset($validated['farmer_id']), function ($query) use ($validated) {
                $query->where('farmer_id', $validated['farmer_id']);
            })
            ->when(isset($validated['status']), function ($query) use ($validated) {
                $query->where('status', $validated['status']);
            })
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return PayoutResource::collection($payouts)->response();
    }

    /**
     * Admin: Create a payout record manually or upon delivery completion.
     *
     * POST /api/admin/payouts
     */
    public function store(StorePayoutRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $payout = Payout::create([
            'farmer_id'            => $validated['farmer_id'],
            'order_fulfillment_id' => $validated['order_fulfillment_id'],
            'amount'               => $validated['amount'],
            'reference'            => $validated['reference'] ?? ('PO-' . strtoupper(\Illuminate\Support\Str::random(8))),
            'status'               => 'pending',
        ]);

        return response()->json([
            'message' => 'Payout record created successfully.',
            'payout'  => new PayoutResource($payout->load(['farmer', 'fulfillment'])),
        ], 201);
    }

    /**
     * Admin: Update payout status (e.g. mark processed or failed).
     *
     * PATCH /api/admin/payouts/{id}/status
     */
    public function updateStatus(UpdatePayoutStatusRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();
        $payout = Payout::findOrFail($id);

        $updateData = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'processed' && ! $payout->processed_at) {
            $updateData['processed_at'] = now();
        }

        if (isset($validated['reference'])) {
            $updateData['reference'] = $validated['reference'];
        }

        $payout->update($updateData);

        return response()->json([
            'message' => 'Payout status updated successfully.',
            'payout'  => new PayoutResource($payout->fresh(['farmer', 'fulfillment'])),
        ]);
    }
}
