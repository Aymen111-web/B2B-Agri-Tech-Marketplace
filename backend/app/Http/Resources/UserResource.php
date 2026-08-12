<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'first_name'        => $this->first_name,
            'second_name'       => $this->second_name,
            'phone'             => $this->phone,
            'phone_verified_at' => $this->phone_verified_at,
            'is_admin'          => $this->is_admin,
            'account_status'    => $this->account_status,
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,

            // Conditionally loaded relationships
            'capabilities'             => UserCapabilityResource::collection($this->whenLoaded('capabilities')),
            'capability_applications'  => CapabilityApplicationResource::collection($this->whenLoaded('capabilityApplications')),
        ];
    }
}
