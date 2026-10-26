<?php

use App\Enums\RoleName;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use Database\Seeders\CatalogAndInventorySeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Spatie\Activitylog\Models\Activity;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('puebla el catalogo electronico realista con el seeder y devuelve KPIs en /dashboard', function () {
    $admin = User::factory()->create(['email' => 'admin@lara.test'])->assignRole(RoleName::SuperAdmin->value);
    $this->seed(CatalogAndInventorySeeder::class);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/dashboard')
        ->assertOk()
        ->assertJsonPath('data.kpis.active_products', 9)
        ->assertJsonStructure([
            'data' => [
                'kpis' => ['inventory_value', 'active_products', 'low_stock_count', 'movements_today'],
                'low_stock_alerts',
                'recent_movements',
            ],
        ]);
});

it('permite a admin crear un producto con variantes y stock inicial', function () {
    $admin = User::factory()->create()->assignRole(RoleName::Admin->value);
    $category = Category::create(['name' => 'Audio', 'slug' => 'audio']);
    $brand = Brand::create(['name' => 'Bose', 'slug' => 'bose', 'code' => 'BOS']);
    $warehouse = Warehouse::create(['code' => 'ALM-01', 'name' => 'Central']);

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/products', [
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'name' => 'Bose QuietComfort Ultra',
            'base_sku' => 'BOS-QCU',
            'initial_warehouse_id' => $warehouse->id,
            'variants' => [
                [
                    'sku' => 'BOS-QCU-BLK',
                    'color' => 'Negro',
                    'price' => 429.00,
                    'cost' => 310.00,
                    'min_stock' => 5,
                    'initial_stock' => 15,
                ],
            ],
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Bose QuietComfort Ultra')
        ->assertJsonPath('data.total_stock', 15);
});

it('bloquea a sales al intentar crear productos o registrar movimientos (403)', function () {
    $sales = User::factory()->create()->assignRole(RoleName::Sales->value);
    $category = Category::create(['name' => 'Audio', 'slug' => 'audio']);
    $brand = Brand::create(['name' => 'Bose', 'slug' => 'bose', 'code' => 'BOS']);
    $warehouse = Warehouse::create(['code' => 'ALM-01', 'name' => 'Central']);

    $this->actingAs($sales, 'sanctum')
        ->postJson('/api/v1/products', [
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'name' => 'Producto Prohibido',
            'base_sku' => 'PRO-001',
            'variants' => [
                ['sku' => 'PRO-001-A', 'price' => 100, 'cost' => 50],
            ],
        ])
        ->assertForbidden();

    $this->actingAs($sales, 'sanctum')
        ->postJson('/api/v1/stock-movements', [
            'type' => 'in',
            'product_variant_id' => '01J00000000000000000000000',
            'warehouse_id' => $warehouse->id,
            'quantity' => 5,
        ])
        ->assertForbidden();
});

it('registra entradas, exige contrasena en ajustes/salidas, impide sobregiro y transfiere entre almacenes', function () {
    $manager = User::factory()->create(['password' => 'password'])->assignRole(RoleName::InventoryManager->value);
    $category = Category::create(['name' => 'Celulares', 'slug' => 'celulares']);
    $brand = Brand::create(['name' => 'Apple', 'slug' => 'apple', 'code' => 'APL']);
    $central = Warehouse::create(['code' => 'ALM-01', 'name' => 'Central']);
    $norte = Warehouse::create(['code' => 'ALM-02', 'name' => 'Sucursal Norte']);

    $product = $category->products()->create([
        'brand_id' => $brand->id,
        'name' => 'iPhone 15',
        'slug' => 'iphone-15',
        'base_sku' => 'APL-IP15',
    ]);
    /** @var ProductVariant $variant */
    $variant = $product->variants()->create([
        'sku' => 'APL-IP15-128-BLK',
        'price' => 799,
        'cost' => 620,
    ]);

    // 1. Entrada de 20 unidades
    $this->actingAs($manager, 'sanctum')
        ->postJson('/api/v1/stock-movements', [
            'type' => 'in',
            'product_variant_id' => $variant->id,
            'warehouse_id' => $central->id,
            'quantity' => 20,
            'reference' => 'OC-100',
        ])
        ->assertCreated()
        ->assertJsonPath('data.balance_after', 20);

    // 2. Ajuste sin contraseña debe fallar con 422
    $this->actingAs($manager, 'sanctum')
        ->postJson('/api/v1/stock-movements', [
            'type' => 'adjustment',
            'product_variant_id' => $variant->id,
            'warehouse_id' => $central->id,
            'quantity' => -2,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('current_password');

    // 3. Ajuste con contraseña válida descuenta stock y deja registro en activity_log
    $this->actingAs($manager, 'sanctum')
        ->postJson('/api/v1/stock-movements', [
            'type' => 'adjustment',
            'product_variant_id' => $variant->id,
            'warehouse_id' => $central->id,
            'quantity' => -2,
            'reason' => 'Merma verificada',
            'current_password' => 'password',
        ])
        ->assertCreated()
        ->assertJsonPath('data.balance_after', 18);

    expect(Activity::where('log_name', 'inventory')->count())->toBe(1);

    // 4. Salida mayor al disponible (18) debe rechazarse con 422
    $this->actingAs($manager, 'sanctum')
        ->postJson('/api/v1/stock-movements', [
            'type' => 'out',
            'product_variant_id' => $variant->id,
            'warehouse_id' => $central->id,
            'quantity' => 50,
            'current_password' => 'password',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('quantity');

    // 5. Transferencia de 8 unidades de Central a Sucursal Norte
    $this->actingAs($manager, 'sanctum')
        ->postJson('/api/v1/stock-movements', [
            'type' => 'transfer',
            'product_variant_id' => $variant->id,
            'warehouse_id' => $central->id,
            'to_warehouse_id' => $norte->id,
            'quantity' => 8,
            'reference' => 'TR-01',
        ])
        ->assertCreated()
        ->assertJsonPath('data.balance_after', 10);

    expect(Stock::where('warehouse_id', $central->id)->value('quantity'))->toBe(10)
        ->and(Stock::where('warehouse_id', $norte->id)->value('quantity'))->toBe(8);
});

it('permite crear proveedores con PII cifrada y gestionar ordenes de compra con recepcion de stock', function () {
    $admin = User::factory()->create()->assignRole(RoleName::Admin->value);
    $manager = User::factory()->create()->assignRole(RoleName::InventoryManager->value);
    $category = Category::create(['name' => 'Perifericos', 'slug' => 'perifericos']);
    $brand = Brand::create(['name' => 'Logitech', 'slug' => 'logitech', 'code' => 'LOG']);
    $warehouse = Warehouse::create(['code' => 'ALM-01', 'name' => 'Almacén Central']);

    $product = $category->products()->create([
        'brand_id' => $brand->id,
        'name' => 'Logitech MX Keys S',
        'slug' => 'logitech-mx-keys-s',
        'base_sku' => 'LOG-MXKS',
    ]);
    /** @var ProductVariant $variant */
    $variant = $product->variants()->create([
        'sku' => 'LOG-MXKS-GRY',
        'price' => 109.00,
        'cost' => 72.00,
    ]);

    // 1. Admin crea proveedor con PII cifrada
    $supplierRes = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/suppliers', [
            'code' => 'PRV-0099',
            'legal_name' => 'NextGen Electronics Corp.',
            'trade_name' => 'NextGen Dist.',
            'tax_id' => '99-1234567',
            'contact_name' => 'Elena Torres',
            'contact_email' => 'elena@nextgen.example.com',
            'contact_phone' => '+1 305 555 0199',
            'city' => 'Miami',
            'state' => 'FL',
        ])
        ->assertCreated()
        ->assertJsonPath('data.code', 'PRV-0099')
        ->assertJsonPath('data.contact_email', 'elena@nextgen.example.com');

    $supplierId = $supplierRes->json('data.id');

    // 2. Inventory manager crea una orden de compra por 10 unidades
    $poRes = $this->actingAs($manager, 'sanctum')
        ->postJson('/api/v1/purchase-orders', [
            'supplier_id' => $supplierId,
            'warehouse_id' => $warehouse->id,
            'items' => [
                [
                    'product_variant_id' => $variant->id,
                    'quantity_ordered' => 10,
                    'unit_cost' => 72.00,
                ],
            ],
        ])
        ->assertCreated()
        ->assertJsonPath('data.status', 'sent')
        ->assertJsonPath('data.total', 720);

    $poId = $poRes->json('data.id');
    $itemId = $poRes->json('data.items.0.id');

    // 3. Recepción parcial de 6 unidades incrementa el stock a 6 y deja la orden en partially_received
    $this->actingAs($manager, 'sanctum')
        ->postJson("/api/v1/purchase-orders/{$poId}/receive", [
            'items' => [
                ['item_id' => $itemId, 'quantity_received' => 6],
            ],
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'partially_received')
        ->assertJsonPath('data.items.0.quantity_received', 6)
        ->assertJsonPath('data.items.0.pending', 4);

    expect(Stock::where('product_variant_id', $variant->id)->where('warehouse_id', $warehouse->id)->value('quantity'))->toBe(6);

    // 4. Recepción de las 4 unidades restantes completa la orden (received) y sube el stock a 10
    $this->actingAs($manager, 'sanctum')
        ->postJson("/api/v1/purchase-orders/{$poId}/receive", [
            'items' => [
                ['item_id' => $itemId, 'quantity_received' => 4],
            ],
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'received')
        ->assertJsonPath('data.items.0.quantity_received', 10)
        ->assertJsonPath('data.items.0.pending', 0);

    expect(Stock::where('product_variant_id', $variant->id)->where('warehouse_id', $warehouse->id)->value('quantity'))->toBe(10);
});
