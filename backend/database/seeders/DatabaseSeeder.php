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

        // Usuarios de demostracion: NUNCA en produccion.
        if (app()->isProduction()) {
            return;
        }

        $demo = [
            ['Ana Martinez', 'admin@lara.test', RoleName::SuperAdmin],
            ['Carlos Ruiz', 'inventory@lara.test', RoleName::InventoryManager],
            ['Maria Lopez', 'sales@lara.test', RoleName::Sales],
        ];

        foreach ($demo as [$name, $email, $role]) {
            User::factory()->create(['name' => $name, 'email' => $email])->assignRole($role->value);
        }
    }
}
