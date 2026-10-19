<?php

namespace App\Http\Resources\Api\V1;

use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProductVariant */
class ProductVariantResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totalStock = $this->relationLoaded('stocks')
            ? (int) $this->stocks->sum('quantity')
            : (int) ($this->total_stock ?? 0);

        $totalReserved = $this->relationLoaded('stocks')
            ? (int) $this->stocks->sum('reserved')
            : (int) ($this->total_reserved ?? 0);

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'color' => $this->color,
            'storage' => $this->storage,
            'attributes' => $this->attributes,
            'price' => (float) $this->price,
            'cost' => (float) $this->cost,
            'min_stock' => $this->min_stock,
            'is_active' => $this->is_active,
            'stock' => $totalStock,
            'reserved' => $totalReserved,
            'available' => $totalStock - $totalReserved,
            'stocks_by_warehouse' => $this->whenLoaded('stocks', fn () => $this->stocks->map(fn ($s) => [
                'warehouse_id' => $s->warehouse_id,
                'warehouse_name' => $s->relationLoaded('warehouse') ? $s->warehouse?->name : null,
                'warehouse_code' => $s->relationLoaded('warehouse') ? $s->warehouse?->code : null,
                'warehouse_city' => $s->relationLoaded('warehouse') ? $s->warehouse?->city : null,
                'quantity' => $s->quantity,
                'reserved' => $s->reserved,
                'available' => $s->available,
            ])),
        ];
    }
}
