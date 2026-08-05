<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderFulfillmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'farmer_id' => $this->farmer_id,
            'farmer' => $this->whenLoaded('farmer', function () {
                return new UserResource($this->farmer);
            }),
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'items' => $this->whenLoaded('items', function () {
                return OrderItemResource::collection($this->items);
            }),
        ];
    }
}
