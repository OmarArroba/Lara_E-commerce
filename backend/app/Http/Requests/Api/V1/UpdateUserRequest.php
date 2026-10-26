<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\RoleName;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('users.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'string', Rule::in(RoleName::values())],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
