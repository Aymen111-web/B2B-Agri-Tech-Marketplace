<?php

namespace App\Policies;

use App\Models\CartItem;
use App\Models\User;

class CartItemPolicy
{
    /**
     * Only users with active buyer capability can view their cart.
     */
    public function viewAny(User $user): bool
    {
        return $this->hasActiveBuyerCapability($user);
    }

    /**
     * Only the cart item owner can view it.
     */
    public function view(User $user, CartItem $cartItem): bool
    {
        return $this->hasActiveBuyerCapability($user)
            && $cartItem->buyer_id === $user->id;
    }

    /**
     * Only users with active buyer capability can add to cart.
     */
    public function create(User $user): bool
    {
        return $this->hasActiveBuyerCapability($user);
    }

    /**
     * Only the cart item owner can update it.
     */
    public function update(User $user, CartItem $cartItem): bool
    {
        return $this->hasActiveBuyerCapability($user)
            && $cartItem->buyer_id === $user->id;
    }

    /**
     * Only the cart item owner can delete it.
     */
    public function delete(User $user, CartItem $cartItem): bool
    {
        return $this->hasActiveBuyerCapability($user)
            && $cartItem->buyer_id === $user->id;
    }

    /**
     * Only users with active buyer capability can clear their cart.
     */
    public function clear(User $user): bool
    {
        return $this->hasActiveBuyerCapability($user);
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
