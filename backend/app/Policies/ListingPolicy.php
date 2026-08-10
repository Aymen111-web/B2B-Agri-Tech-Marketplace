<?php

namespace App\Policies;

use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    /**
     * Anyone can browse/view active listings (public routes — no policy needed).
     * This method covers the farmer's own listing list.
     */
    public function viewOwn(User $user): bool
    {
        return $this->hasActiveFarmerCapability($user);
    }

    /**
     * Only users with active farmer capability can create listings.
     */
    public function create(User $user): bool
    {
        return $this->hasActiveFarmerCapability($user);
    }

    /**
     * Only the listing owner with active farmer capability can update.
     */
    public function update(User $user, Listing $listing): bool
    {
        return $this->hasActiveFarmerCapability($user)
            && $listing->farmer_id === $user->id;
    }

    /**
     * Only the listing owner with active farmer capability can delete.
     */
    public function delete(User $user, Listing $listing): bool
    {
        return $this->hasActiveFarmerCapability($user)
            && $listing->farmer_id === $user->id;
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
