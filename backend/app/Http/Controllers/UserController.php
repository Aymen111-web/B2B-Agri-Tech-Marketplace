<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Get the authenticated user's profile with capabilities.
     *
     * GET /api/profile
     */
    public function profile(): JsonResponse
    {
        $user = Auth::user();

        $user->load(['capabilities', 'capabilityApplications']);

        return response()->json($user);
    }

    /**
     * Update the authenticated user's profile.
     *
     * PUT /api/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'first_name'  => 'sometimes|string|max:255',
            'second_name' => 'sometimes|string|max:255',
            'phone'       => 'sometimes|string|unique:users,phone,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * List all users — admin only, with optional filters.
     *
     * GET /api/admin/users?account_status=active&capability=farmer&search=term&per_page=20
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may list users.',
            ], 403);
        }

        $validated = $request->validate([
            'account_status' => 'sometimes|string|in:active,suspended',
            'capability'     => 'sometimes|string|in:farmer,buyer',
            'search'         => 'sometimes|string|max:255',
            'per_page'       => 'sometimes|integer|min:1|max:100',
        ]);

        $users = User::with('capabilities')
            ->when(isset($validated['account_status']), fn ($q) => $q->where('account_status', $validated['account_status']))
            ->when(isset($validated['capability']), fn ($q) => $q->whereHas('capabilities', function ($sub) use ($validated) {
                $sub->where('capability_type', $validated['capability'])
                    ->where('status', 'active');
            }))
            ->when(isset($validated['search']), fn ($q) => $q->where(function ($sub) use ($validated) {
                $sub->where('first_name', 'like', '%' . $validated['search'] . '%')
                    ->orWhere('second_name', 'like', '%' . $validated['search'] . '%')
                    ->orWhere('phone', 'like', '%' . $validated['search'] . '%');
            }))
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return response()->json($users);
    }

    /**
     * Show a specific user's details — admin only.
     *
     * GET /api/admin/users/{userId}
     */
    public function show(int $userId): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may view user details.',
            ], 403);
        }

        $target = User::with([
            'capabilities',
            'capabilityApplications',
        ])->findOrFail($userId);

        return response()->json($target);
    }

    /**
     * Suspend a user account — admin only.
     *
     * POST /api/admin/users/{userId}/suspend
     */
    public function suspend(int $userId): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may suspend users.',
            ], 403);
        }

        $target = User::findOrFail($userId);

        if ($target->id === $user->id) {
            return response()->json([
                'message' => 'You cannot suspend your own account.',
            ], 422);
        }

        if ($target->account_status === 'suspended') {
            return response()->json([
                'message' => 'User is already suspended.',
            ], 422);
        }

        $target->update(['account_status' => 'suspended']);

        return response()->json([
            'message' => 'User account suspended.',
            'user'    => $target->fresh(),
        ]);
    }

    /**
     * Activate (unsuspend) a user account — admin only.
     *
     * POST /api/admin/users/{userId}/activate
     */
    public function activate(int $userId): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may activate users.',
            ], 403);
        }

        $target = User::findOrFail($userId);

        if ($target->account_status === 'active') {
            return response()->json([
                'message' => 'User is already active.',
            ], 422);
        }

        $target->update(['account_status' => 'active']);

        return response()->json([
            'message' => 'User account activated.',
            'user'    => $target->fresh(),
        ]);
    }

    /**
     * Get a user's active capabilities — admin only.
     *
     * GET /api/admin/users/{userId}/capabilities
     */
    public function capabilities(int $userId): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may view user capabilities.',
            ], 403);
        }

        $target = User::findOrFail($userId);

        $capabilities = $target->capabilities()
            ->with('application')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($capabilities);
    }

    /**
     * Get platform user statistics — admin only.
     *
     * GET /api/admin/users/stats
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may view user statistics.',
            ], 403);
        }

        $stats = [
            'total_users'      => User::count(),
            'active_users'     => User::where('account_status', 'active')->count(),
            'suspended_users'  => User::where('account_status', 'suspended')->count(),
            'verified_farmers' => User::whereHas('capabilities', fn ($q) => $q->where('capability_type', 'farmer')->where('status', 'active'))->count(),
            'verified_buyers'  => User::whereHas('capabilities', fn ($q) => $q->where('capability_type', 'buyer')->where('status', 'active'))->count(),
            'admin_count'      => User::where('is_admin', true)->count(),
        ];

        return response()->json($stats);
    }
}
