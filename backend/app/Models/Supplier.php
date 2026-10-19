<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'code', 'legal_name', 'trade_name', 'tax_id', 'website',
        'contact_name', 'contact_position', 'contact_email', 'contact_phone',
        'address', 'city', 'state', 'postal_code', 'country',
        'currency', 'payment_terms', 'lead_time', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            // Datos de contacto cifrados en reposo (PII).
            'tax_id' => 'encrypted',
            'contact_email' => 'encrypted',
            'contact_phone' => 'encrypted',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
