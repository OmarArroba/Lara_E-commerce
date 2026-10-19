<?php

use App\Enums\MovementType;
use App\Enums\RoleName;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

it('define los cinco roles con sus permisos', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $sales = User::factory()->create()->assignRole(RoleName::Sales->value);
    $manager = User::factory()->create()->assignRole(RoleName::InventoryManager->value);
    $admin = User::factory()->create()->assignRole(RoleName::SuperAdmin->value);

    expect($sales->can('products.view'))->toBeTrue()
        ->and($sales->can('stock.move'))->toBeFalse()
        ->and($manager->can('stock.adjust'))->toBeTrue()
        ->and($manager->can('users.manage'))->toBeFalse()
        ->and($admin->can('users.manage'))->toBeTrue();
});

/** Crea el minimo de datos para insertar un movimiento. */
function movementPayload(): array
{
    $variant = ProductVariant::create([
        'product_id' => Product::create([
            'category_id' => Category::create(['name' => 'Celulares', 'slug' => 'celulares'])->id,
            'brand_id' => Brand::create(['name' => 'Apple', 'slug' => 'apple', 'code' => 'APL'])->id,
            'name' => 'iPhone 15 Pro', 'slug' => 'iphone-15-pro', 'base_sku' => 'APL-IP15P',
        ])->id,
        'sku' => 'APL-IP15P-256-BLK', 'price' => 1199, 'cost' => 965,
    ]);

    return [
        'product_variant_id' => $variant->id,
        'warehouse_id' => Warehouse::create(['code' => 'ALM-01', 'name' => 'Central'])->id,
        'type' => MovementType::In,
        'quantity' => 10,
        'balance_after' => 10,
        'user_id' => User::factory()->create()->id,
    ];
}

it('permite agregar movimientos pero la base de datos rechaza editarlos o borrarlos', function () {
    $movement = (new StockMovement)->forceFill(movementPayload());
    $movement->save();

    // Cada intento va en un savepoint: en PostgreSQL un error aborta la transaccion del test.
    expect(fn () => DB::transaction(fn () => DB::table('stock_movements')->where('id', $movement->id)->update(['quantity' => 99])))
        ->toThrow(QueryException::class, 'solo-agregar');

    expect(fn () => DB::transaction(fn () => DB::table('stock_movements')->where('id', $movement->id)->delete()))
        ->toThrow(QueryException::class, 'solo-agregar');
});

it('impide stock negativo a nivel de base de datos', function () {
    $payload = movementPayload();

    expect(fn () => DB::transaction(fn () => DB::table('stocks')->insert([
        'id' => (string) Str::ulid(),
        'product_variant_id' => $payload['product_variant_id'],
        'warehouse_id' => $payload['warehouse_id'],
        'quantity' => -1,
        'reserved' => 0,
    ])))->toThrow(QueryException::class);
});
