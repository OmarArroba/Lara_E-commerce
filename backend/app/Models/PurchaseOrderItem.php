<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    use HasUlids;

    protected $fillable = ['purchase_order_id', 'product_variant_id', 'quantity_ordered', 'unit_cost'];

    protected function casts(): array
    {
        return ['unit_cost' => 'decimal:2', 'quantity_ordered' => 'integer', 'quantity_received' => 'integer'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function getPendingAttribute(): int
    {
        return $this->quantity_ordered - $this->quantity_received;
    }
}
