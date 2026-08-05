<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditLogController extends Controller
{
    /**
     * List audit logs — admin only, with optional filters.
     *
     * GET /api/admin/audit-logs?action=listing.created&user_id=1&auditable_type=App\Models\Listing&per_page=20
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may view audit logs.',
            ], 403);
        }

        $validated = $request->validate([
            'action'         => ['sometimes', 'string', 'max:255'],
            'user_id'        => ['sometimes', 'integer', 'exists:users,id'],
            'auditable_type' => ['sometimes', 'string', 'max:255'],
            'auditable_id'   => ['sometimes', 'integer'],
            'per_page'       => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $logs = AuditLog::with('user')
            ->when(isset($validated['action']),         fn ($q) => $q->where('action', $validated['action']))
            ->when(isset($validated['user_id']),         fn ($q) => $q->where('user_id', $validated['user_id']))
            ->when(isset($validated['auditable_type']),  fn ($q) => $q->where('auditable_type', $validated['auditable_type']))
            ->when(isset($validated['auditable_id']),    fn ($q) => $q->where('auditable_id', $validated['auditable_id']))
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return response()->json($logs);
    }

    /**
     * Show a single audit log entry — admin only.
     *
     * GET /api/admin/audit-logs/{auditLog}
     */
    public function show(AuditLog $auditLog): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may view audit logs.',
            ], 403);
        }

        $auditLog->load('user');

        return response()->json($auditLog);
    }

    /**
     * List audit logs for a specific auditable resource — admin only.
     *
     * GET /api/admin/audit-logs/resource?type=App\Models\Order&id=5
     */
    public function forResource(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may view audit logs.',
            ], 403);
        }

        $validated = $request->validate([
            'type'     => ['required', 'string', 'max:255'],
            'id'       => ['required', 'integer'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $logs = AuditLog::with('user')
            ->where('auditable_type', $validated['type'])
            ->where('auditable_id',   $validated['id'])
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return response()->json($logs);
    }

    /**
     * List audit logs created by a specific user — admin only.
     *
     * GET /api/admin/audit-logs/user/{userId}
     */
    public function forUser(int $userId): JsonResponse
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            return response()->json([
                'message' => 'Only admins may view audit logs.',
            ], 403);
        }

        $logs = AuditLog::where('user_id', $userId)
            ->with('user')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($logs);
    }

    /**
     * Get the authenticated user's own activity log.
     *
     * GET /api/my-activity
     *
     * Users can only see their own logs — no admin check required.
     */
    public function myActivity(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'action'   => ['sometimes', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $logs = AuditLog::where('user_id', $user->id)
            ->when(isset($validated['action']), fn ($q) => $q->where('action', $validated['action']))
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20);

        return response()->json($logs);
    }
}
