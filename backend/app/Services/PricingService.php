<?php

namespace App\Services;

use App\Models\Listing;

class PricingService
{
    /**
     * Validate if a listing's price is still active and valid.
     */
    public function validateListingPrice(Listing $listing): bool
    {
        if ($listing->status !== 'active') {
            return false;
        }

        if ($listing->price_valid_until && now()->greaterThan($listing->price_valid_until)) {
            return false;
        }

        if ($listing->price_valid_from && now()->lessThan($listing->price_valid_from)) {
            return false;
        }

        return true;
    }

    /**
     * Validate if the requested quantity meets or exceeds the minimum order quantity.
     */
    public function validateMinimumOrderQuantity(Listing $listing, float $requestedQuantity): bool
    {
        $moq = (float) ($listing->minimum_order_quantity ?? 1.000);

        return $requestedQuantity >= $moq;
    }
}
