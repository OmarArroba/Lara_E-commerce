<?php

namespace App\Http\Resources\Api\V1;

use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin StockMovement */
class StockMovementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => 'MOV-'.strtoupper(substr($this->id, -6)),
            'type' => $this->type->value,
            'quantity' => $this->quantity,
            'balance_after' => $this->balance_after,
            'reference' => $this->reference,
            'reason' => $this->reason,
            'variant' => $this->whenLoaded('variant', fn () => $this->variant ? [
                'id' => $this->variant->id,
                'sku' => $this->variant->sku,
                'color' => $this->variant->color,
                'storage' => $this->variant->storage,
                'product_id' => $this->variant->product_id,
                'product_name' => $this->variant->relationLoaded('product') ? $this->variant->product?->name : null,
            ] : null),
            'warehouse' => $this->whenLoaded('warehouse', fn () => $this->warehouse ? [
                'id' => $this->warehouse->id,
                'code' => $this->warehouse->code,
                'name' => $this->warehouse->name,
            ] : null),
            'related_warehouse' => $this->whenLoaded('relatedWarehouse', fn () => $this->relatedWarehouse ? [
                'id' => $this->relatedWarehouse->id,
                'code' => $this->relatedWarehouse->code,
                'name' => $this->relatedWarehouse->name,
            ] : null),
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
