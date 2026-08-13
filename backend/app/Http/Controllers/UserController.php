<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListUsersRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserCapabilityResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
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
        $this->authorize('viewProfile', User::class);

        $user = Auth::user();

        $user->load(['capabilities', 'capabilityApplications']);

        return response()->json(new UserResource($user));
    }

    /**
     * Update the authenticated user's profile.
     *
     * PUT /api/profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $this->authorize('updateProfile', User::class);

        $user = Auth::user();

        $validated = $request->validated();

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => new UserResource($user->fresh()),
        ]);
    }

    /**
     * List all users — admin only, with optional filters.
     *
     * GET /api/admin/users?account_status=active&capability=farmer&search=term&per_page=20
     */
    public function index(ListUsersRequest $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $validated = $request->validated();

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

        return UserResource::collection($users)->response();
    }

    /**
     * Show a specific user's details — admin only.
     *
     * GET /api/admin/users/{userId}
     */
    public function show(int $userId): JsonResponse
    {
        $target = User::with([
            'capabilities',
            'capabilityApplications',
        ])->findOrFail($userId);

        $this->authorize('view', $target);

        return response()->json(new UserResource($target));
    }

    /**
     * Suspend a user account — admin only.
     *
     * POST /api/admin/users/{userId}/suspend
     */
    public function suspend(int $userId): JsonResponse
    {
        $user = Auth::user();
        $target = User::findOrFail($userId);

        if ($target->id === $user->id) {
            return response()->json([
                'message' => 'You cannot suspend your own account.',
            ], 422);
        }

        $this->authorize('suspend', $target);

        if ($target->account_status === 'suspended') {
            return response()->json([
                'message' => 'User is already suspended.',
            ], 422);
        }

        $target->update(['account_status' => 'suspended']);

        return response()->json([
            'message' => 'User account suspended.',
            'user'    => new UserResource($target->fresh()),
        ]);
    }

    /**
     * Activate (unsuspend) a user account — admin only.
     *
     * POST /api/admin/users/{userId}/activate
     */
    public function activate(int $userId): JsonResponse
    {
        $target = User::findOrFail($userId);

        $this->authorize('activate', $target);

        if ($target->account_status === 'active') {
            return response()->json([
                'message' => 'User is already active.',
            ], 422);
        }

        $target->update(['account_status' => 'active']);

        return response()->json([
            'message' => 'User account activated.',
            'user'    => new UserResource($target->fresh()),
        ]);
    }

    /**
     * Get a user's active capabilities — admin only.
     *
     * GET /api/admin/users/{userId}/capabilities
     */
    public function capabilities(int $userId): JsonResponse
    {
        $target = User::findOrFail($userId);

        $this->authorize('viewCapabilities', $target);

        $capabilities = $target->capabilities()
            ->with('application')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(UserCapabilityResource::collection($capabilities));
    }

    /**
     * Get platform user statistics — admin only.
     *
     * GET /api/admin/users/stats
     */
    public function stats(): JsonResponse
    {
        $this->authorize('viewStats', User::class);

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
