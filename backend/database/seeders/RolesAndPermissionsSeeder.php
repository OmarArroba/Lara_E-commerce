<?php

namespace Database\Seeders;

use App\Enums\RoleName;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /** Recursos con CRUD estandar. */
    private const RESOURCES = ['products', 'categories', 'brands', 'suppliers', 'warehouses'];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = collect(self::RESOURCES)
            ->flatMap(fn (string $r) => ["$r.view", "$r.create", "$r.update", "$r.delete"])
            ->merge([
                'stock.view', 'stock.move', 'stock.adjust',
                'purchase-orders.view', 'purchase-orders.create', 'purchase-orders.update', 'purchase-orders.receive',
                'reports.view', 'reports.export',
                'audit.view',
                'users.view', 'users.manage',
            ]);

        $permissions->each(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $views = $permissions->filter(fn (string $p) => str_ends_with($p, '.view'))->all();

        // super_admin: todo (ademas, Gate::before en AppServiceProvider).
        Role::findOrCreate(RoleName::SuperAdmin->value, 'web')->syncPermissions($permissions->all());

        // admin: todo excepto gestionar usuarios.
        Role::findOrCreate(RoleName::Admin->value, 'web')
            ->syncPermissions($permissions->reject(fn (string $p) => $p === 'users.manage')->all());

        // inventory_manager: catalogo de lectura + stock, compras y reportes.
        Role::findOrCreate(RoleName::InventoryManager->value, 'web')->syncPermissions([
            ...array_diff($views, ['users.view', 'audit.view']),
            'stock.move', 'stock.adjust',
            'purchase-orders.create', 'purchase-orders.update', 'purchase-orders.receive',
            'reports.export',
        ]);

        // sales: solo lectura.
        Role::findOrCreate(RoleName::Sales->value, 'web')
            ->syncPermissions(array_diff($views, ['users.view', 'audit.view']));

        // api_client: tokens de servicio con alcance minimo.
        Role::findOrCreate(RoleName::ApiClient->value, 'web')
            ->syncPermissions(['products.view', 'stock.view']);
    }
}
