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

it('permite a super_admin gestionar usuarios y roles e impide a otros roles crear usuarios o autodesactivarse', function () {
    $superAdmin = User::factory()->create(['email' => 'root@lara.test'])->assignRole(RoleName::SuperAdmin->value);
    $admin = User::factory()->create(['email' => 'admin2@lara.test'])->assignRole(RoleName::Admin->value);
    $sales = User::factory()->create(['email' => 'sales2@lara.test'])->assignRole(RoleName::Sales->value);

    // 1. Admin puede listar usuarios (users.view), pero NO puede crear usuarios (users.manage = 403)
    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/users')
        ->assertOk()
        ->assertJsonCount(3, 'data');

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/users', [
            'name' => 'No Autorizado',
            'email' => 'unauthorized@lara.test',
            'password' => 'password123',
            'role' => RoleName::Sales->value,
        ])
        ->assertForbidden();

    // 2. Sales no puede ni siquiera listar usuarios (403)
    $this->actingAs($sales, 'sanctum')
        ->getJson('/api/v1/users')
        ->assertForbidden();

    // 3. SuperAdmin crea un nuevo usuario con rol inventory_manager
    $createdRes = $this->actingAs($superAdmin, 'sanctum')
        ->postJson('/api/v1/users', [
            'name' => 'Laura Almacén',
            'email' => 'laura@lara.test',
            'password' => 'password123',
            'role' => RoleName::InventoryManager->value,
        ])
        ->assertCreated()
        ->assertJsonPath('data.email', 'laura@lara.test')
        ->assertJsonPath('data.roles.0', 'inventory_manager')
        ->assertJsonPath('data.is_active', true);

    $newUserId = $createdRes->json('data.id');

    // 4. SuperAdmin puede desactivar al nuevo usuario, pero NO puede desactivarse a sí mismo (422)
    $this->actingAs($superAdmin, 'sanctum')
        ->patchJson("/api/v1/users/{$newUserId}", ['is_active' => false])
        ->assertOk()
        ->assertJsonPath('data.is_active', false);

    $this->actingAs($superAdmin, 'sanctum')
        ->patchJson("/api/v1/users/{$superAdmin->id}", ['is_active' => false])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('is_active');
});

it('permite consultar el registro de auditoria (activity_log) con filtros y bloquea a roles sin audit.view', function () {
    $admin = User::factory()->create(['email' => 'admin@lara.test'])->assignRole(RoleName::SuperAdmin->value);
    $sales = User::factory()->create(['email' => 'sales-audit@lara.test'])->assignRole(RoleName::Sales->value);

    $this->seed(CatalogAndInventorySeeder::class);

    // 1. Sales no tiene permiso audit.view (403)
    $this->actingAs($sales, 'sanctum')
        ->getJson('/api/v1/audit-logs')
        ->assertForbidden();

    // 2. Admin consulta todos los eventos de auditoría y filtra por canal inventory
    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/audit-logs')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'log_name', 'description', 'subject_type', 'causer', 'properties', 'created_at'],
            ],
        ]);

    $invRes = $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/audit-logs?log_name=inventory')
        ->assertOk();

    expect(collect($invRes->json('data'))->every(fn (array $row) => $row['log_name'] === 'inventory'))->toBeTrue();
});

it('devuelve metricas de valorizacion en /reports y exporta CSV para roles con reports.export', function () {
    $admin = User::factory()->create(['email' => 'admin@lara.test'])->assignRole(RoleName::SuperAdmin->value);
    $sales = User::factory()->create(['email' => 'sales-report@lara.test'])->assignRole(RoleName::Sales->value);

    $this->seed(CatalogAndInventorySeeder::class);

    // 1. Sales puede consultar métricas de reportes (reports.view = 200)
    $this->actingAs($sales, 'sanctum')
        ->getJson('/api/v1/reports')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                'summary' => [
                    'total_units',
                    'total_cost_value',
                    'total_retail_value',
                    'estimated_profit',
                    'estimated_margin_percent',
                    'active_products',
                    'active_variants',
                    'active_warehouses',
                ],
                'by_category',
                'by_warehouse',
            ],
        ]);

    // 2. Sales NO puede exportar CSV (reports.export = 403)
    $this->actingAs($sales, 'sanctum')
        ->get('/api/v1/reports/export')
        ->assertForbidden();

    // 3. Admin descarga el CSV valorizado y se registra evento en activity_log
    $csvRes = $this->actingAs($admin, 'sanctum')
        ->get('/api/v1/reports/export')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    expect($csvRes->getContent())->toContain('SKU,Producto,Categoria,Marca,Almacen_Codigo');
});

it('permite crear y editar almacenes y realizar busquedas globales en /search', function () {
    $admin = User::factory()->create(['email' => 'admin@lara.test'])->assignRole(RoleName::SuperAdmin->value);
    $sales = User::factory()->create(['email' => 'sales-wh@lara.test'])->assignRole(RoleName::Sales->value);

    $this->seed(CatalogAndInventorySeeder::class);

    // 1. Sales no puede crear almacenes (403)
    $this->actingAs($sales, 'sanctum')
        ->postJson('/api/v1/warehouses', [
            'code' => 'ALM-JAX-05',
            'name' => 'Hub Jacksonville',
        ])
        ->assertForbidden();

    // 2. Admin crea y edita un nuevo almacén
    $whRes = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/warehouses', [
            'code' => 'ALM-JAX-05',
            'name' => 'Hub Jacksonville',
            'city' => 'Jacksonville, FL',
            'capacity_units' => 6500,
        ])
        ->assertCreated()
        ->assertJsonPath('data.code', 'ALM-JAX-05')
        ->assertJsonPath('data.capacity_units', 6500);

    $whId = $whRes->json('data.id');

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/warehouses/{$whId}", [
            'name' => 'Hub Logístico Jacksonville',
            'status' => 'maintenance',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Hub Logístico Jacksonville')
        ->assertJsonPath('data.status', 'maintenance');

    // 3. Búsqueda global (/api/v1/search?q=...) devuelve productos, almacenes y órdenes de compra
    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/search?q=iPhone')
        ->assertOk()
        ->assertJsonPath('data.products.0.name', 'iPhone 15 Pro');

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/search?q=Jacksonville')
        ->assertOk()
        ->assertJsonPath('data.warehouses.0.code', 'ALM-JAX-05');

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/search?q=OC-2026-0184')
        ->assertOk()
        ->assertJsonPath('data.purchase_orders.0.number', 'OC-2026-0184');
});
