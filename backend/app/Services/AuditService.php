<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Record an immutable audit log entry for any lifecycle transition.
     */
    public static function log(
        string $action,
        Model $auditable,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $userId = null
    ): AuditLog {
        return AuditLog::create([
            'user_id'        => $userId ?? Auth::id(),
            'action'         => $action,
            'auditable_type' => get_class($auditable),
            'auditable_id'   => $auditable->getKey(),
            'old_values'     => $oldValues,
            'new_values'     => $newValues,
            'ip_address'     => Request::ip() ?? '127.0.0.1',
            'created_at'     => now(),
        ]);
    }
}
