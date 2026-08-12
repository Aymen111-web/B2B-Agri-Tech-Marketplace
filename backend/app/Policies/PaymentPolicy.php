<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class PaymentPolicy
{
    /**
     * Only the order's buyer with an active buyer capability can initiate payment.
     */
    public function initiate(User $user, Order $order): bool
    {
        return $this->hasActiveBuyerCapability($user)
            && $order->buyer_id === $user->id;
    }

    /**
     * Only the order's buyer with an active buyer capability can view payment details.
     */
    public function view(User $user, Order $order): bool
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
