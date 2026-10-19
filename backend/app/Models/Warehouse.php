<?php

namespace App\Models;

use App\Enums\WarehouseStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = ['code', 'name', 'address', 'city', 'manager_id', 'capacity_units', 'status'];

    protected function casts(): array
    {
        return ['status' => WarehouseStatus::class, 'capacity_units' => 'integer'];
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }
}
