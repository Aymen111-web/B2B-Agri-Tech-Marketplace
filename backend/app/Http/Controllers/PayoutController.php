<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListPayoutsRequest;
use App\Http\Requests\MonthlyPayoutReportRequest;
use App\Http\Requests\StorePayoutRequest;
use App\Http\Requests\UpdatePayoutStatusRequest;
use App\Http\Resources\PayoutResource;
use App\Models\OrderFulfillment;
use App\Models\Payout;
use Illuminate\Http\JsonResponse;

class PayoutController extends Controller
{
    /**
     * Get all payouts for authenticated farmer.
     *
     * GET /api/payouts?status=pending&per_page=20
     */
    public function index(ListPayoutsRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Payout::class);

        $user      = auth()->user();
        $validated = $request->validated();

        $payouts = Payout::where('farmer_id', $user->id)
            ->with(['fulfillment.order'])
            ->when(isset($validated['status']), fn ($q) => $q->where('status', $validated['status']))
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return PayoutResource::collection($payouts)->response();
    }

    /**
     * Display a specific payout.
     *
     * GET /api/payouts/{payout}
     */
    public function show(Payout $payout): JsonResponse
    {
        $this->authorize('view', $payout);

        $payout->load(['fulfillment.order', 'farmer']);

        return response()->json(new PayoutResource($payout));
    }

    /**
     * Get payout summary for authenticated farmer.
     *
     * GET /api/payouts/summary
     */
    public function summary(): JsonResponse
    {
        $this->authorize('viewAny', Payout::class);

        $user    = auth()->user();
        $payouts = Payout::where('farmer_id', $user->id)->get();

        $summary = [
            'total_earned'    => $payouts->sum('amount'),
            'pending'         => $payouts->where('status', 'pending')->sum('amount'),
            'processed'       => $payouts->where('status', 'processed')->sum('amount'),
            'failed'          => $payouts->where('status', 'failed')->sum('amount'),
            'payout_count'    => $payouts->count(),
            'pending_count'   => $payouts->where('status', 'pending')->count(),
            'processed_count' => $payouts->where('status', 'processed')->count(),
        ];

        return response()->json($summary);
    }

    /**
     * Get pending payouts for the authenticated farmer.
     *
     * GET /api/payouts/pending
     */
    public function pending(): JsonResponse
    {
        $this->authorize('viewAny', Payout::class);

        $user = auth()->user();

        $payouts = Payout::where('farmer_id', $user->id)
            ->where('status', 'pending')
            ->with('fulfillment.order')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(PayoutResource::collection($payouts));
    }

    /**
     * Get processed payouts for the authenticated farmer.
     *
     * GET /api/payouts/processed
     */
    public function processed(): JsonResponse
    {
        $this->authorize('viewAny', Payout::class);

        $user = auth()->user();

        $payouts = Payout::where('farmer_id', $user->id)
            ->where('status', 'processed')
            ->with(['fulfillment.order'])
            ->orderByDesc('processed_at')
            ->paginate(20);

        return PayoutResource::collection($payouts)->response();
    }

    /**
     * Create a payout — admin action, typically triggered by a batch settlement job.
     *
     * POST /api/admin/payouts
     */
    public function store(StorePayoutRequest $request): JsonResponse
    {
        $this->authorize('create', Payout::class);

        $validated = $request->validated();

        // Verify the fulfillment belongs to the stated farmer.
        $fulfillment = OrderFulfillment::findOrFail($validated['order_fulfillment_id']);

        if ((int) $fulfillment->farmer_id !== (int) $validated['farmer_id']) {
            return response()->json([
                'message' => 'Fulfillment does not belong to this farmer.',
            ], 422);
        }

        if ($fulfillment->payout_status !== 'eligible') {
            return response()->json([
                'message' => 'Fulfillment is not yet eligible for payout. Buyer inspection and delivery approval required.',
            ], 422);
        }

        if (Payout::where('order_fulfillment_id', $fulfillment->id)->whereIn('status', ['pending', 'processed'])->exists()) {
            return response()->json([
                'message' => 'Payout already exists or is pending for this fulfillment.',
            ], 422);
        }

        $payout = Payout::create($validated);

        return response()->json(new PayoutResource($payout), 201);
    }

    /**
     * Update a payout's status — admin only.
     *
     * PATCH /api/admin/payouts/{payout}/status
     */
    public function updateStatus(UpdatePayoutStatusRequest $request, Payout $payout): JsonResponse
    {
        $this->authorize('update', $payout);

        $validated = $request->validated();

        $payout->update($validated);

        if ($validated['status'] === 'processed') {
            $payout->update(['processed_at' => now()]);
        }

        return response()->json([
            'message' => 'Payout status updated.',
            'payout'  => new PayoutResource($payout->fresh()),
        ]);
    }

    /**
     * Get payout history for the admin dashboard.
     *
     * GET /api/admin/payouts?farmer_id=&status=&per_page=20
     */
    public function history(ListPayoutsRequest $request): JsonResponse
    {
        $this->authorize('viewAll', Payout::class);

        $validated = $request->validated();

        $payouts = Payout::with(['farmer', 'fulfillment.order'])
            ->when(isset($validated['farmer_id']), fn ($q) => $q->where('farmer_id', $validated['farmer_id']))
            ->when(isset($validated['status']),    fn ($q) => $q->where('status', $validated['status']))
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return PayoutResource::collection($payouts)->response();
    }

    /**
     * Get a monthly payout report for the authenticated farmer.
     *
     * GET /api/payouts/monthly-report?month=2026-08
     */
    public function monthlyReport(MonthlyPayoutReportRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Payout::class);

        $validated = $request->validated();
        $farmer    = auth()->user();
        $month     = $validated['month'];

        $payouts = Payout::where('farmer_id', $farmer->id)
            ->whereYear('created_at', substr($month, 0, 4))
            ->whereMonth('created_at', substr($month, 5, 2))
            ->with('fulfillment.order')
            ->get();

        $report = [
            'month'            => $month,
            'total_payouts'    => $payouts->count(),
            'total_amount'     => $payouts->sum('amount'),
            'processed_amount' => $payouts->where('status', 'processed')->sum('amount'),
            'pending_amount'   => $payouts->where('status', 'pending')->sum('amount'),
            'payouts'          => PayoutResource::collection($payouts),
        ];

        return response()->json($report);
    }
}
