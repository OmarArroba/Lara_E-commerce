<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStockMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if ($user === null) {
            return false;
        }

        if ($this->input('type') === 'adjustment') {
            return $user->can('stock.adjust');
        }

        return $user->can('stock.move');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $type = (string) $this->input('type');
        $isSensitive = in_array($type, ['adjustment', 'out'], true);

        return [
            'type' => ['required', 'string', Rule::in(['in', 'out', 'adjustment', 'return', 'transfer'])],
            'product_variant_id' => ['required', 'string', 'exists:product_variants,id'],
            'warehouse_id' => ['required', 'string', 'exists:warehouses,id'],
            'to_warehouse_id' => [
                Rule::requiredIf($type === 'transfer'),
                'nullable',
                'string',
                'different:warehouse_id',
                'exists:warehouses,id',
            ],
            'quantity' => $type === 'adjustment'
                ? ['required', 'integer', 'not_in:0']
                : ['required', 'integer', 'min:1'],
            'reference' => ['nullable', 'string', 'max:80'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'current_password' => $isSensitive
                ? ['required', 'string', 'current_password']
                : ['nullable', 'string'],
        ];
    }
}
