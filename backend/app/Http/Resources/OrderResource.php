<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'order_number' => $this->order_number,
            'buyer_id'     => $this->buyer_id,
            'status'       => $this->status,
            'total_amount' => $this->total_amount,
            'currency'     => $this->currency,
            'placed_at'    => $this->placed_at,
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,

            // Conditionally loaded relationships
            'buyer'        => new UserResource($this->whenLoaded('buyer')),
            'items'        => OrderItemResource::collection($this->whenLoaded('items')),
            'fulfillments' => OrderFulfillmentResource::collection($this->whenLoaded('fulfillments')),
            'payment'      => new PaymentResource($this->whenLoaded('payment')),
        ];
    }
}
