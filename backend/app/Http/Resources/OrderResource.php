<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'buyer_id' => $this->buyer_id,
            'buyer' => $this->whenLoaded('buyer', function () {
                return new UserResource($this->buyer);
            }),
            'status' => $this->status,
            'total_amount' => (float) $this->total_amount,
            'currency' => $this->currency,
            'placed_at' => $this->placed_at?->toISOString(),
            'fulfillments' => $this->whenLoaded('fulfillments', function () {
                return OrderFulfillmentResource::collection($this->fulfillments);
            }),
            'items' => $this->whenLoaded('items', function () {
                return OrderItemResource::collection($this->items);
            }),
            'payment' => $this->whenLoaded('payment', function () {
                return new PaymentResource($this->payment);
            }),
        ];
    }
}
