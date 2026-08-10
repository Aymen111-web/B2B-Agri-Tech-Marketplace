<?php

namespace App\Policies;

use App\Models\OrderFulfillment;
use App\Models\User;

class OrderFulfillmentPolicy
{
    /**
     * Only users with active farmer capability can list their fulfillments.
     */
    public function viewAny(User $user): bool
    {
        return $this->hasActiveFarmerCapability($user);
    }

    /**
     * Only the assigned farmer can view a fulfillment.
     */
    public function view(User $user, OrderFulfillment $fulfillment): bool
    {
        return $this->hasActiveFarmerCapability($user)
            && $fulfillment->farmer_id === $user->id;
    }

    /**
     * Only the assigned farmer can accept a fulfillment.
     */
    public function accept(User $user, OrderFulfillment $fulfillment): bool
    {
        return $this->hasActiveFarmerCapability($user)
            && $fulfillment->farmer_id === $user->id;
    }

    /**
     * Only the assigned farmer can reject a fulfillment.
     */
    public function reject(User $user, OrderFulfillment $fulfillment): bool
    {
        return $this->hasActiveFarmerCapability($user)
            && $fulfillment->farmer_id === $user->id;
    }

    /**
     * Only the assigned farmer can complete a fulfillment.
     */
    public function complete(User $user, OrderFulfillment $fulfillment): bool
    {
        return $this->hasActiveFarmerCapability($user)
            && $fulfillment->farmer_id === $user->id;
    }

    /**
     * Check whether the given user has an active farmer capability.
     */
    private function hasActiveFarmerCapability(User $user): bool
    {
        return $user->capabilities()
            ->where('capability_type', 'farmer')
            ->where('status', 'active')
            ->exists();
    }
}
