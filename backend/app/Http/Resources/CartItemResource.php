<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'buyer_id' => $this->buyer_id,
            'listing_id' => $this->listing_id,
            'quantity' => (float) $this->quantity,
            'price_snapshot' => (float) $this->price_snapshot,
            'listing' => $this->whenLoaded('listing', function () {
                return new ProductResource($this->listing);
            }),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
