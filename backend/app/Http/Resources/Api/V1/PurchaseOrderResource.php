<?php

namespace App\Http\Resources\Api\V1;

use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin PurchaseOrder */
class PurchaseOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $itemsLoaded = $this->relationLoaded('items');

        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status->value,
            'expected_at' => $this->expected_at?->toDateString(),
            'sent_at' => $this->sent_at?->toIso8601String(),
            'received_at' => $this->received_at?->toIso8601String(),
            'total' => (float) $this->total,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'supplier' => $this->whenLoaded('supplier', fn () => [
                'id' => $this->supplier->id,
                'code' => $this->supplier->code,
                'legal_name' => $this->supplier->legal_name,
                'trade_name' => $this->supplier->trade_name,
                'contact_name' => $this->supplier->contact_name,
                'contact_email' => $this->supplier->contact_email,
                'contact_phone' => $this->supplier->contact_phone,
            ]),
            'warehouse' => $this->whenLoaded('warehouse', fn () => [
                'id' => $this->warehouse->id,
                'code' => $this->warehouse->code,
                'name' => $this->warehouse->name,
                'city' => $this->warehouse->city,
            ]),
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'items_count' => $itemsLoaded ? $this->items->count() : (int) ($this->resource->getAttributes()['items_count'] ?? 0),
            'total_quantity_ordered' => $itemsLoaded ? (int) $this->items->sum('quantity_ordered') : 0,
            'total_quantity_received' => $itemsLoaded ? (int) $this->items->sum('quantity_received') : 0,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(function ($item) {
                $variant = $item->relationLoaded('variant') ? $item->variant : null;
                $product = ($variant && $variant->relationLoaded('product')) ? $variant->product : null;
                $image = ($product && $product->relationLoaded('images')) ? $product->images->first()?->path : null;

                return [
                    'id' => $item->id,
                    'product_variant_id' => $item->product_variant_id,
                    'sku' => $variant?->sku,
                    'color' => $variant?->color,
                    'storage' => $variant?->storage,
                    'product_id' => $product?->id,
                    'product_name' => $product?->name,
                    'image' => $image,
                    'quantity_ordered' => (int) $item->quantity_ordered,
                    'quantity_received' => (int) $item->quantity_received,
                    'pending' => (int) $item->pending,
                    'unit_cost' => (float) $item->unit_cost,
                    'subtotal' => round((float) $item->unit_cost * (int) $item->quantity_ordered, 2),
                ];
            })),
        ];
    }
}
