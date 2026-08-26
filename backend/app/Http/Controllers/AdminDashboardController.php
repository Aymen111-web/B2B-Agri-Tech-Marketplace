<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\CapabilityApplication;
use App\Models\Category;
use App\Models\Listing;
use App\Models\Order;
use App\Models\PaymentException;
use App\Models\Payout;
use App\Models\UserCapability;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get aggregated metrics, stats, recent activity, and pending queue for Admin Home dashboard.
     *
     * GET /api/admin/dashboard/stats
     */
    public function stats(Request $request): JsonResponse
    {
        // 1. Financial & Volume KPIs
        $totalGmv = Order::whereIn('status', ['paid', 'processing', 'fulfilled', 'completed'])
            ->sum('total_amount');

        $totalOrders = Order::count();

        // 2. Capabilities & User Base KPIs
        $verifiedFarmers = UserCapability::where('capability_type', 'farmer')
            ->where('status', 'active')
            ->count();

        $verifiedBuyers = UserCapability::where('capability_type', 'buyer')
            ->where('status', 'active')
            ->count();

        $pendingApplicationsCount = CapabilityApplication::where('status', 'pending')->count();

        // 3. Inventory & Operations KPIs
        $activeListingsCount = Listing::where('status', 'active')->count();

        $pendingPayoutsCount = Payout::where('status', 'pending')->count();
        $pendingPayoutsAmount = Payout::where('status', 'pending')->sum('amount');

        $paymentExceptionsCount = PaymentException::whereIn('status', ['pending', 'investigating'])->count();

        // 4. Recent Audit Logs / Activity Stream (latest 8)
        $recentActivity = AuditLog::with(['user:id,first_name,second_name,phone,is_admin'])
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        // 5. Pending Applications Preview (latest 5)
        $pendingApplications = CapabilityApplication::with(['user:id,first_name,second_name,phone'])
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // 6. Produce Distribution by Category
        $categoryDistribution = Category::withCount(['listings' => function ($q) {
            $q->where('status', 'active');
        }])
        ->get()
        ->map(function ($cat) {
            $totalQty = Listing::where('category_id', $cat->id)
                ->where('status', 'active')
                ->sum('quantity_available');

            return [
                'id'                 => $cat->id,
                'name'               => $cat->name,
                'slug'               => $cat->slug,
                'listings_count'     => $cat->listings_count,
                'total_quantity_kg'  => (float) $totalQty,
            ];
        });

        return response()->json([
            'kpis' => [
                'total_gmv'                 => (float) $totalGmv,
                'total_orders'              => $totalOrders,
                'verified_farmers'          => $verifiedFarmers,
                'verified_buyers'           => $verifiedBuyers,
                'pending_applications'      => $pendingApplicationsCount,
                'active_listings'           => $activeListingsCount,
                'pending_payouts_count'     => $pendingPayoutsCount,
                'pending_payouts_amount'    => (float) $pendingPayoutsAmount,
                'payment_exceptions_count'  => $paymentExceptionsCount,
            ],
            'recent_activity'             => $recentActivity,
            'pending_applications'        => $pendingApplications,
            'category_distribution'       => $categoryDistribution,
        ]);
    }
}
