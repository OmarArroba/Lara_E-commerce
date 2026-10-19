<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inicia sesion (SPA con cookie de sesion + CSRF de Sanctum).
     */
    public function login(LoginRequest $request): UserResource
    {
        $credentials = $request->safe()->only(['email', 'password']);

        // Mensaje unico para credenciales invalidas y cuentas inactivas: evita enumerar usuarios.
        $fail = fn () => throw ValidationException::withMessages([
            'email' => [__('auth.failed')],
        ]);

        if (! Auth::guard('web')->validate($credentials)) {
            $fail();
        }

        /** @var User $user */
        $user = User::where('email', $credentials['email'])->firstOrFail();

        if (! $user->is_active) {
            $fail();
        }

        Auth::guard('web')->login($user, (bool) $request->boolean('remember'));
        $request->session()->regenerate(); // previene session fixation

        $user->forceFill(['last_login_at' => now()])->save();

        return new UserResource($user);
    }

    /**
     * Usuario autenticado, con sus roles y permisos (el frontend los usa para ocultar acciones).
     */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): Response|JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
