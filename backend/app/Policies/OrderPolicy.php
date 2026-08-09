<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Only users with active buyer capability can list their orders.
     */
    public function viewAny(User $user): bool
    {
        return $this->hasActiveBuyerCapability($user);
    }

    /**
     * Only the order's buyer can view it.
     */
    public function view(User $user, Order $order): bool
    {
        return $this->hasActiveBuyerCapability($user)
            && $order->buyer_id === $user->id;
    }

    /**
     * Only users with active buyer capability can checkout (create orders).
     */
    public function create(User $user): bool
    {
        return $this->hasActiveBuyerCapability($user);
    }

    /**
     * Only the order's buyer can cancel it.
     */
    public function cancel(User $user, Order $order): bool
    {
        return $this->hasActiveBuyerCapability($user)
            && $order->buyer_id === $user->id;
    }

    /**
     * Check whether the given user has an active buyer capability.
     */
    private function hasActiveBuyerCapability(User $user): bool
    {
        return $user->capabilities()
            ->where('capability_type', 'buyer')
            ->where('status', 'active')
            ->exists();
    }
}
