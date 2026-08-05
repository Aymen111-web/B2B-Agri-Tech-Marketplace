<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingPriceHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'price_per_unit' => (float) $this->price_per_unit,
            'changed_by' => $this->whenLoaded('changedBy', function () {
                return new UserResource($this->changedBy);
            }),
            'effective_at' => $this->effective_at?->toISOString(),
        ];
    }
}
