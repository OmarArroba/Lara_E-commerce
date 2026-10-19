<?php

namespace Database\Seeders;

use App\Enums\RoleName;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        // Usuarios y catálogo de demostración: NUNCA en producción.
        if (app()->isProduction()) {
            return;
        }

        $demo = [
            ['Ana Martínez', 'admin@lara.test', RoleName::SuperAdmin],
            ['Carlos Ruiz', 'inventory@lara.test', RoleName::InventoryManager],
            ['María López', 'sales@lara.test', RoleName::Sales],
        ];

        foreach ($demo as [$name, $email, $role]) {
            $user = User::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => 'password', 'email_verified_at' => now(), 'is_active' => true]
            );
            $user->syncRoles([$role->value]);
        }

        $this->call(CatalogAndInventorySeeder::class);
    }
}
