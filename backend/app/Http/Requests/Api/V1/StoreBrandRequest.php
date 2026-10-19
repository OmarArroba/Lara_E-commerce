<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('brands.create');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:10', 'unique:brands,code'],
            'website' => ['nullable', 'url', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
