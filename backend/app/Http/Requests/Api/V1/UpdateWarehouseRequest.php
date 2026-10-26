<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\WarehouseStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('warehouses.update') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'manager_id' => ['nullable', 'integer', 'exists:users,id'],
            'capacity_units' => ['nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'string', Rule::in(array_column(WarehouseStatus::cases(), 'value'))],
        ];
    }
}
