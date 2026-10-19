<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('products.create');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'string', 'exists:categories,id'],
            'brand_id' => ['required', 'string', 'exists:brands,id'],
            'supplier_id' => ['nullable', 'string', 'exists:suppliers,id'],
            'name' => ['required', 'string', 'max:180'],
            'base_sku' => ['required', 'string', 'max:64', 'unique:products,base_sku'],
            'barcode' => ['nullable', 'string', 'max:64', 'unique:products,barcode'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['sometimes', Rule::enum(ProductStatus::class)],
            'image' => ['nullable', 'url', 'max:500'],
            'initial_warehouse_id' => ['nullable', 'string', 'exists:warehouses,id'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.sku' => ['required', 'string', 'max:64', 'distinct', 'unique:product_variants,sku'],
            'variants.*.color' => ['nullable', 'string', 'max:80'],
            'variants.*.storage' => ['nullable', 'string', 'max:80'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.cost' => ['required', 'numeric', 'min:0'],
            'variants.*.min_stock' => ['sometimes', 'integer', 'min:0'],
            'variants.*.initial_stock' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
