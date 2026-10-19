<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    use HasUlids;

    /** Las cantidades solo cambian a traves de StockService (no por asignacion masiva). */
    protected $fillable = ['product_variant_id', 'warehouse_id'];

    protected function casts(): array
    {
        return ['quantity' => 'integer', 'reserved' => 'integer'];
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function getAvailableAttribute(): int
    {
        return $this->quantity - $this->reserved;
    }
}
