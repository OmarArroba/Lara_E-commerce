<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'product_id', 'sku', 'color', 'storage', 'attributes',
        'price', 'cost', 'min_stock', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'attributes' => 'array',
            'price' => 'decimal:2',
            'cost' => 'decimal:2',
            'min_stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
