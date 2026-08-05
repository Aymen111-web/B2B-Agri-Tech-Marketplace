<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', function () {
                return new CategoryResource($this->category);
            }),
            'farmer_id' => $this->farmer_id,
            'farmer' => $this->whenLoaded('farmer', function () {
                return new UserResource($this->farmer);
            }),
            'unit' => $this->unit,
            'price_per_unit' => (float) $this->price_per_unit,
            'quantity_available' => (float) $this->quantity_available,
            'quantity_reserved' => (float) $this->quantity_reserved,
            'status' => $this->status,
            'price_history' => $this->whenLoaded('priceHistory', function () {
                return ListingPriceHistoryResource::collection($this->priceHistory);
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
