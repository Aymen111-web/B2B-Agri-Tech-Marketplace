<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'farmer_id'          => $this->farmer_id,
            'category_id'        => $this->category_id,
            'title'              => $this->title,
            'description'        => $this->description,
            'unit'               => $this->unit,
            'price_per_unit'     => $this->price_per_unit,
            'quantity_available' => $this->quantity_available,
            'quantity_reserved'  => $this->quantity_reserved,
            'status'             => $this->status,
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,

            // Conditionally loaded relationships
            'farmer'        => new UserResource($this->whenLoaded('farmer')),
            'category'      => new CategoryResource($this->whenLoaded('category')),
            'price_history' => ListingPriceHistoryResource::collection($this->whenLoaded('priceHistory')),
        ];
    }
}
