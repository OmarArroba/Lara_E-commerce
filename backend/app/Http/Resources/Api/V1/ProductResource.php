<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Product */
class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $variants = $this->relationLoaded('variants') ? $this->variants : collect();

        $totalStock = $variants->sum(fn ($v) => $v->relationLoaded('stocks') ? $v->stocks->sum('quantity') : (int) ($v->total_stock ?? 0));
        $minStockThreshold = $variants->max('min_stock') ?? 8;
        $minPrice = $variants->min(fn ($v) => (float) $v->price) ?? 0.0;
        $primarySku = $variants->first()?->sku ?? $this->base_sku;

        $inventoryState = match (true) {
            $this->status->value !== 'active' => 'archived',
            $totalStock <= 0 => 'out_of_stock',
            $totalStock < $minStockThreshold => 'low_stock',
            default => 'in_stock',
        };

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'base_sku' => $this->base_sku,
            'primary_sku' => $primarySku,
            'barcode' => $this->barcode,
            'description' => $this->description,
            'status' => $this->status->value,
            'inventory_state' => $inventoryState,
            'total_stock' => (int) $totalStock,
            'price' => (float) $minPrice,
            'image' => $this->whenLoaded('images', fn () => $this->images->first()?->path),
            'images' => $this->whenLoaded('images', fn () => $this->images->pluck('path')->values()),
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ] : null),
            'brand' => $this->whenLoaded('brand', fn () => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
                'code' => $this->brand->code,
            ] : null),
            'supplier' => $this->whenLoaded('supplier', fn () => $this->supplier ? [
                'id' => $this->supplier->id,
                'name' => $this->supplier->trade_name ?: $this->supplier->legal_name,
                'code' => $this->supplier->code,
            ] : null),
            'variants_count' => $variants->count(),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
