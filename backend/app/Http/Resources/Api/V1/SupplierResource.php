<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Supplier */
class SupplierResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $attributes = $this->resource->getAttributes();

        return [
            'id' => $this->id,
            'code' => $this->code,
            'legal_name' => $this->legal_name,
            'trade_name' => $this->trade_name,
            'tax_id' => $this->tax_id,
            'website' => $this->website,
            'contact_name' => $this->contact_name,
            'contact_position' => $this->contact_position,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'currency' => $this->currency,
            'payment_terms' => $this->payment_terms,
            'lead_time' => $this->lead_time,
            'is_active' => $this->is_active,
            'products_count' => (int) ($attributes['products_count'] ?? 0),
            'purchase_orders_count' => (int) ($attributes['purchase_orders_count'] ?? 0),
            'total_purchased' => (float) ($attributes['total_purchased'] ?? 0),
        ];
    }
}
