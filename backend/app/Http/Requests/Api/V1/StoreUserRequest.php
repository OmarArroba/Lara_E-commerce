<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\RoleName;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:160', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:120'],
            'role' => ['required', 'string', Rule::in(RoleName::values())],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
