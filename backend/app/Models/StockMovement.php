<?php

namespace App\Models;

use App\Enums\MovementType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Libro de movimientos: solo-agregar. La BD rechaza UPDATE y DELETE (trigger).
 */
class StockMovement extends Model
{
    use HasUlids;

    public const UPDATED_AT = null;

    protected $guarded = ['*'];

    protected function casts(): array
    {
        return ['type' => MovementType::class, 'quantity' => 'integer', 'balance_after' => 'integer'];
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
