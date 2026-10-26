<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RoleName;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreUserRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()?->can('users.view'), 403);

        $users = User::query()
            ->with(['roles.permissions', 'permissions'])
            ->orderBy('id')
            ->get();

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $actor = $request->user();

        $user = DB::transaction(function () use ($validated, $actor): User {
            $newUser = User::create([
                'name' => $validated['name'],
                'email' => strtolower($validated['email']),
                'password' => $validated['password'],
            ]);

            $newUser->forceFill([
                'is_active' => $validated['is_active'] ?? true,
                'email_verified_at' => now(),
            ])->save();

            $newUser->syncRoles([$validated['role']]);

            activity('users')
                ->performedOn($newUser)
                ->causedBy($actor)
                ->withProperties([
                    'email' => $newUser->email,
                    'role' => $validated['role'],
                    'is_active' => $newUser->is_active,
                ])
                ->log("Usuario creado: {$newUser->email} con rol {$validated['role']}");

            return $newUser->load(['roles.permissions', 'permissions']);
        });

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $validated = $request->validated();
        $actor = $request->user();

        if ($user->id === $actor->id) {
            if (array_key_exists('is_active', $validated) && $validated['is_active'] === false) {
                throw ValidationException::withMessages([
                    'is_active' => ['No puedes desactivar tu propia cuenta activa.'],
                ]);
            }

            if (isset($validated['role']) && $validated['role'] !== RoleName::SuperAdmin->value) {
                throw ValidationException::withMessages([
                    'role' => ['No puedes revocar tu propio rol de super_admin.'],
                ]);
            }
        }

        $updated = DB::transaction(function () use ($user, $validated, $actor): User {
            if (array_key_exists('is_active', $validated)) {
                $user->forceFill(['is_active' => (bool) $validated['is_active']])->save();
            }

            if (isset($validated['role'])) {
                $user->syncRoles([$validated['role']]);
            }

            $user->load(['roles.permissions', 'permissions']);

            activity('users')
                ->performedOn($user)
                ->causedBy($actor)
                ->withProperties([
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->values()->all(),
                    'is_active' => $user->is_active,
                ])
                ->log("Usuario actualizado: {$user->email}");

            return $user;
        });

        return new UserResource($updated);
    }
}
