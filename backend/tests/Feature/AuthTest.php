<?php

use App\Enums\RoleName;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(fn () => $this->seed(RolesAndPermissionsSeeder::class));

/** Las rutas de Sanctum SPA exigen un Origin/Referer de un dominio "stateful". */
function spa(): array
{
    return ['Referer' => 'http://localhost:5173', 'Accept' => 'application/json'];
}

it('inicia sesion con credenciales validas y devuelve roles y permisos', function () {
    $user = User::factory()->create(['email' => 'ana@lara.test'])->assignRole(RoleName::InventoryManager->value);

    $this->withHeaders(spa())
        ->postJson('/api/v1/auth/login', ['email' => 'ana@lara.test', 'password' => 'password'])
        ->assertOk()
        ->assertJsonPath('data.email', 'ana@lara.test')
        ->assertJsonPath('data.roles.0', 'inventory_manager')
        ->assertJsonMissingPath('data.password');

    expect($user->fresh()->last_login_at)->not->toBeNull();
});

it('rechaza contrasenas incorrectas con un mensaje generico', function () {
    User::factory()->create(['email' => 'ana@lara.test']);

    $this->withHeaders(spa())
        ->postJson('/api/v1/auth/login', ['email' => 'ana@lara.test', 'password' => 'incorrecta'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

it('no distingue entre usuario inexistente y usuario inactivo', function () {
    User::factory()->create(['email' => 'off@lara.test', 'is_active' => false]);

    $inactive = $this->withHeaders(spa())
        ->postJson('/api/v1/auth/login', ['email' => 'off@lara.test', 'password' => 'password']);
    $missing = $this->withHeaders(spa())
        ->postJson('/api/v1/auth/login', ['email' => 'nadie@lara.test', 'password' => 'password']);

    $inactive->assertUnprocessable();
    expect($inactive->json('errors'))->toEqual($missing->json('errors'));
});

it('limita los intentos de login por correo e IP', function () {
    foreach (range(1, 5) as $i) {
        $this->withHeaders(spa())->postJson('/api/v1/auth/login', ['email' => 'x@lara.test', 'password' => 'mal']);
    }

    $this->withHeaders(spa())
        ->postJson('/api/v1/auth/login', ['email' => 'x@lara.test', 'password' => 'mal'])
        ->assertTooManyRequests();
});

it('exige autenticacion para /me', function () {
    $this->getJson('/api/v1/auth/me')->assertUnauthorized();
});

it('devuelve el usuario autenticado en /me', function () {
    $user = User::factory()->create()->assignRole(RoleName::Sales->value);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonFragment(['products.view']);
});

it('incluye cabeceras de seguridad', function () {
    $this->getJson('/api/v1/auth/me')
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY');
});
