<?php

namespace Database\Seeders;

use App\Enums\MovementType;
use App\Enums\ProductStatus;
use App\Enums\PurchaseOrderStatus;
use App\Enums\WarehouseStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\StockService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogAndInventorySeeder extends Seeder
{
    public function run(StockService $stockService): void
    {
        if (Category::query()->exists()) {
            return;
        }

        $admin = User::where('email', 'admin@lara.test')->first() ?? User::firstOrFail();
        $manager = User::where('email', 'inventory@lara.test')->first() ?? $admin;
        $sales = User::where('email', 'sales@lara.test')->first() ?? $admin;

        // 1. Árbol de categorías
        $categoryTree = [
            'Celulares y tablets' => ['Smartphones', 'Tablets', 'Accesorios móviles'],
            'Computación' => ['Laptops', 'Monitores', 'Componentes'],
            'Audio' => ['Audífonos', 'Bocinas', 'Micrófonos'],
            'Periféricos' => ['Mouse', 'Teclados', 'Webcams'],
            'Cables y energía' => ['Cargadores', 'Cables'],
        ];

        $categoriesByName = [];
        $rootOrder = 1;
        foreach ($categoryTree as $parentName => $children) {
            $parent = Category::create([
                'name' => $parentName,
                'slug' => Str::slug($parentName),
                'sort_order' => $rootOrder++,
                'is_active' => true,
            ]);
            $categoriesByName[$parentName] = $parent;

            $childOrder = 1;
            foreach ($children as $childName) {
                $child = Category::create([
                    'parent_id' => $parent->id,
                    'name' => $childName,
                    'slug' => Str::slug($childName),
                    'sort_order' => $childOrder++,
                    'is_active' => true,
                ]);
                $categoriesByName[$childName] = $child;
            }
        }

        // 2. Marcas
        $brandsData = [
            ['Apple', 'APL', 'https://apple.com'],
            ['Samsung', 'SAM', 'https://samsung.com'],
            ['Sony', 'SNY', 'https://sony.com'],
            ['Logitech', 'LOG', 'https://logitech.com'],
            ['Lenovo', 'LEN', 'https://lenovo.com'],
            ['Anker', 'ANK', 'https://anker.com'],
            ['Keychron', 'KEY', 'https://keychron.com'],
        ];

        $brands = [];
        foreach ($brandsData as [$name, $code, $website]) {
            $brands[$code] = Brand::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'code' => $code,
                'website' => $website,
                'is_active' => true,
            ]);
        }

        // 3. Proveedores
        $suppliersData = [
            [
                'code' => 'PRV-0018',
                'legal_name' => 'TechDistribution LLC',
                'trade_name' => 'TechDistribution',
                'tax_id' => '65-0918421',
                'website' => 'https://techdistribution.example.com',
                'contact_name' => 'Robert Chen',
                'contact_position' => 'Director de Cuentas',
                'contact_email' => 'robert@techdistribution.com',
                'contact_phone' => '+1 305 555 0184',
                'address' => '1840 NW 72nd Ave',
                'city' => 'Miami',
                'state' => 'FL',
                'postal_code' => '33126',
                'country' => 'US',
                'currency' => 'USD',
                'payment_terms' => 'NET 30',
                'lead_time' => '5-7 días',
            ],
            [
                'code' => 'PRV-0004',
                'legal_name' => 'Apple Authorized Dist. Inc.',
                'trade_name' => 'Apple Authorized Dist.',
                'tax_id' => '59-4402819',
                'website' => 'https://appledist.example.com',
                'contact_name' => 'Sofia Williams',
                'contact_position' => 'Gerente Mayorista',
                'contact_email' => 'sofia@appledist.com',
                'contact_phone' => '+1 407 555 0122',
                'address' => '400 S Orange Ave',
                'city' => 'Orlando',
                'state' => 'FL',
                'postal_code' => '32801',
                'country' => 'US',
                'currency' => 'USD',
                'payment_terms' => 'NET 15',
                'lead_time' => '3-5 días',
            ],
            [
                'code' => 'PRV-0011',
                'legal_name' => 'Global Devices Inc.',
                'trade_name' => 'Global Devices',
                'tax_id' => '58-7731902',
                'website' => 'https://globaldevices.example.com',
                'contact_name' => 'Marco Bellini',
                'contact_position' => 'Ejecutivo Comercial',
                'contact_email' => 'marco@globaldevices.com',
                'contact_phone' => '+1 813 555 0169',
                'address' => '501 E Kennedy Blvd',
                'city' => 'Tampa',
                'state' => 'FL',
                'postal_code' => '33602',
                'country' => 'US',
                'currency' => 'USD',
                'payment_terms' => 'NET 30',
                'lead_time' => '4-6 días',
            ],
        ];

        $suppliers = [];
        foreach ($suppliersData as $s) {
            $suppliers[$s['code']] = Supplier::create($s + ['is_active' => true]);
        }

        // 4. Almacenes
        $warehouses = [
            'central' => Warehouse::create([
                'code' => 'ALM-MIA-01',
                'name' => 'Almacén Central',
                'address' => '1840 NW 72nd Ave',
                'city' => 'Miami, FL',
                'manager_id' => $manager->id,
                'capacity_units' => 10000,
                'status' => WarehouseStatus::Operational,
            ]),
            'norte' => Warehouse::create([
                'code' => 'ALM-ORL-02',
                'name' => 'Sucursal Norte',
                'address' => '400 S Orange Ave',
                'city' => 'Orlando, FL',
                'manager_id' => $manager->id,
                'capacity_units' => 5000,
                'status' => WarehouseStatus::Operational,
            ]),
            'fulfillment' => Warehouse::create([
                'code' => 'ALM-TPA-03',
                'name' => 'Fulfillment Center',
                'address' => '501 E Kennedy Blvd',
                'city' => 'Tampa, FL',
                'manager_id' => $admin->id,
                'capacity_units' => 4000,
                'status' => WarehouseStatus::Operational,
            ]),
            'secundario' => Warehouse::create([
                'code' => 'ALM-MIA-04',
                'name' => 'Depósito secundario',
                'address' => '2100 NW 84th Ave',
                'city' => 'Miami, FL',
                'manager_id' => $manager->id,
                'capacity_units' => 1500,
                'status' => WarehouseStatus::Maintenance,
            ]),
        ];

        // 5. Productos y variantes (alineados con el diseño de Figma Make)
        $catalog = [
            [
                'name' => 'iPhone 15 Pro',
                'base_sku' => 'APL-IP15P',
                'barcode' => '0194253766420',
                'category' => 'Smartphones',
                'brand' => 'APL',
                'supplier' => 'PRV-0004',
                'description' => 'iPhone 15 Pro con diseño de titanio aeroespacial, chip A17 Pro y sistema de cámaras profesional.',
                'image' => 'https://images.unsplash.com/photo-1654555023156-0a1c9cdf1130?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
                'variants' => [
                    ['sku' => 'APL-IP15P-128-NT', 'color' => 'Titanio natural', 'storage' => '128 GB', 'price' => 999.00, 'cost' => 812.00, 'min_stock' => 10, 'stock' => ['central' => 6, 'norte' => 4, 'fulfillment' => 4]],
                    ['sku' => 'APL-IP15P-256-BLK', 'color' => 'Titanio negro', 'storage' => '256 GB', 'price' => 1199.00, 'cost' => 965.00, 'min_stock' => 10, 'stock' => ['central' => 8, 'norte' => 5, 'fulfillment' => 2]],
                    ['sku' => 'APL-IP15P-512-BLU', 'color' => 'Titanio azul', 'storage' => '512 GB', 'price' => 1399.00, 'cost' => 1120.00, 'min_stock' => 8, 'stock' => ['central' => 8, 'norte' => 3, 'fulfillment' => 2]],
                ],
            ],
            [
                'name' => 'Samsung Galaxy S24',
                'base_sku' => 'SAM-S24',
                'barcode' => '8806095392417',
                'category' => 'Smartphones',
                'brand' => 'SAM',
                'supplier' => 'PRV-0018',
                'description' => 'Smartphone Galaxy S24 con pantalla Dynamic AMOLED 2X de 120 Hz y Galaxy AI.',
                'image' => 'https://images.unsplash.com/photo-1729058048010-86f7d7c30001?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
                'variants' => [
                    ['sku' => 'SAM-S24-256-GRY', 'color' => 'Gris mármol', 'storage' => '256 GB', 'price' => 899.00, 'cost' => 710.00, 'min_stock' => 10, 'stock' => ['central' => 5, 'norte' => 2]],
                ],
            ],
            [
                'name' => 'MacBook Air M3 13"',
                'base_sku' => 'APL-MBA-M3',
                'barcode' => '0195949123450',
                'category' => 'Laptops',
                'brand' => 'APL',
                'supplier' => 'PRV-0004',
                'description' => 'MacBook Air de 13 pulgadas con chip M3, hasta 18 horas de batería y pantalla Liquid Retina.',
                'image' => 'https://images.unsplash.com/photo-1654555023156-0a1c9cdf1130?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
                'variants' => [
                    ['sku' => 'APL-MBA-M3-512-SLV', 'color' => 'Plata', 'storage' => '512 GB', 'price' => 1499.00, 'cost' => 1210.00, 'min_stock' => 8, 'stock' => ['central' => 10, 'norte' => 8]],
                ],
            ],
            [
                'name' => 'Lenovo ThinkPad X1 Carbon',
                'base_sku' => 'LEN-TPX1',
                'barcode' => '0196803445121',
                'category' => 'Laptops',
                'brand' => 'LEN',
                'supplier' => 'PRV-0011',
                'description' => 'Ultrabook empresarial ultraligero en fibra de carbono con procesador Intel Core i7.',
                'image' => 'https://images.unsplash.com/photo-1749545849681-37e7b302fdb6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
                'variants' => [
                    ['sku' => 'LEN-TPX1-I7-1TB', 'color' => 'Negro mate', 'storage' => '1 TB', 'price' => 1749.00, 'cost' => 1420.00, 'min_stock' => 6, 'stock' => []],
                ],
            ],
            [
                'name' => 'Sony WH-1000XM5',
                'base_sku' => 'SNY-WH1000XM5',
                'barcode' => '0027242923782',
                'category' => 'Audífonos',
                'brand' => 'SNY',
                'supplier' => 'PRV-0018',
                'description' => 'Audífonos inalámbricos over-ear con cancelación de ruido líder en la industria.',
                'image' => 'https://images.unsplash.com/photo-1615714901553-bfb2b5a27750?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
                'variants' => [
                    ['sku' => 'SNY-WH1000XM5-BLK', 'color' => 'Negro', 'storage' => null, 'price' => 399.00, 'cost' => 285.00, 'min_stock' => 10, 'stock' => ['central' => 20, 'norte' => 11]],
                ],
            ],
            [
                'name' => 'AirPods Pro 2ª gen.',
                'base_sku' => 'APL-APP2',
                'barcode' => '0194253944112',
                'category' => 'Audífonos',
                'brand' => 'APL',
                'supplier' => 'PRV-0004',
                'description' => 'AirPods Pro con estuche de carga MagSafe (USB-C) y audio adaptativo.',
                'image' => 'https://images.unsplash.com/photo-1729058048010-86f7d7c30001?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
                'variants' => [
                    ['sku' => 'APL-APP2-USB-C-WHT', 'color' => 'Blanco', 'storage' => null, 'price' => 249.00, 'cost' => 182.00, 'min_stock' => 10, 'stock' => ['central' => 3, 'fulfillment' => 2]],
                ],
            ],
            [
                'name' => 'Cargador USB-C 65W GaN',
                'base_sku' => 'ANK-CHG-65W',
                'barcode' => '0194644098223',
                'category' => 'Cargadores',
                'brand' => 'ANK',
                'supplier' => 'PRV-0011',
                'description' => 'Cargador compacto Anker Nano II 65W con tecnología GaN II para laptops y smartphones.',
                'image' => 'https://images.unsplash.com/photo-1749545849681-37e7b302fdb6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
                'variants' => [
                    ['sku' => 'ANK-CHG-65W-BLK', 'color' => 'Negro', 'storage' => null, 'price' => 49.00, 'cost' => 28.50, 'min_stock' => 20, 'stock' => ['central' => 56, 'norte' => 30]],
                ],
            ],
            [
                'name' => 'Logitech MX Master 3S',
                'base_sku' => 'LOG-MXM3S',
                'barcode' => '0097855174321',
                'category' => 'Mouse',
                'brand' => 'LOG',
                'supplier' => 'PRV-0011',
                'description' => 'Mouse inalámbrico ergonómico de alto rendimiento con sensor de 8000 DPI y clics silenciosos.',
                'image' => 'https://images.unsplash.com/photo-1654555023156-0a1c9cdf1130?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
                'variants' => [
                    ['sku' => 'LOG-MXM3S-GRY', 'color' => 'Grafito', 'storage' => null, 'price' => 99.00, 'cost' => 64.00, 'min_stock' => 10, 'stock' => ['central' => 15, 'norte' => 8]],
                ],
            ],
            [
                'name' => 'Keychron K2 Pro QMK/VIA',
                'base_sku' => 'KEY-K2P',
                'barcode' => '4895248829104',
                'category' => 'Teclados',
                'brand' => 'KEY',
                'supplier' => 'PRV-0018',
                'description' => 'Teclado mecánico inalámbrico 75% programable con QMK/VIA y switches táctiles.',
                'image' => 'https://images.unsplash.com/photo-1749545849681-37e7b302fdb6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
                'variants' => [
                    ['sku' => 'KEY-K2P-RGB-BRN', 'color' => 'Gris / Marrón', 'storage' => null, 'price' => 119.00, 'cost' => 79.00, 'min_stock' => 8, 'stock' => ['central' => 4]],
                ],
            ],
        ];

        $variantsBySku = [];

        foreach ($catalog as $item) {
            $product = Product::create([
                'category_id' => $categoriesByName[$item['category']]->id,
                'brand_id' => $brands[$item['brand']]->id,
                'supplier_id' => $suppliers[$item['supplier']]->id,
                'name' => $item['name'],
                'slug' => Str::slug($item['name']),
                'base_sku' => $item['base_sku'],
                'barcode' => $item['barcode'],
                'description' => $item['description'],
                'status' => ProductStatus::Active,
            ]);

            $product->images()->create([
                'path' => $item['image'],
                'position' => 0,
            ]);

            foreach ($item['variants'] as $v) {
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $v['sku'],
                    'color' => $v['color'],
                    'storage' => $v['storage'],
                    'price' => $v['price'],
                    'cost' => $v['cost'],
                    'min_stock' => $v['min_stock'],
                    'is_active' => true,
                ]);

                $variantsBySku[$v['sku']] = $variant;

                foreach ($v['stock'] as $warehouseKey => $qty) {
                    if ($qty > 0) {
                        $stockService->recordMovement(
                            variant: $variant,
                            warehouse: $warehouses[$warehouseKey],
                            type: MovementType::In,
                            quantity: $qty,
                            user: $manager,
                            reference: 'OC-2026-0180',
                            reason: 'Carga de inventario inicial',
                        );
                    }
                }
            }
        }

        // 6. Movimientos adicionales realistas (salida, devolución y ajuste)
        $stockService->recordMovement(
            variant: $variantsBySku['SNY-WH1000XM5-BLK'],
            warehouse: $warehouses['norte'],
            type: MovementType::Out,
            quantity: 3,
            user: $sales,
            reference: 'PED-10482',
            reason: 'Salida por pedido mayorista #10482',
        );

        $stockService->recordMovement(
            variant: $variantsBySku['APL-APP2-USB-C-WHT'],
            warehouse: $warehouses['fulfillment'],
            type: MovementType::Return,
            quantity: 1,
            user: $sales,
            reference: 'DEV-2038',
            reason: 'Devolución de cliente en empaque sellado',
        );

        $stockService->recordMovement(
            variant: $variantsBySku['SAM-S24-256-GRY'],
            warehouse: $warehouses['central'],
            type: MovementType::Adjustment,
            quantity: -1,
            user: $admin,
            reference: 'AJ-2026-091',
            reason: 'Ajuste por conteo cíclico',
        );

        // 7. Órdenes de compra de ejemplo (Recibida parcial, Enviada y Recibida)
        $po184 = (new PurchaseOrder)->forceFill([
            'number' => 'OC-2026-0184',
            'supplier_id' => $suppliers['PRV-0018']->id,
            'warehouse_id' => $warehouses['central']->id,
            'status' => PurchaseOrderStatus::PartiallyReceived,
            'expected_at' => now()->addDays(5)->toDateString(),
            'sent_at' => now()->subDays(3),
            'total' => 28460.00,
            'notes' => 'Entrega prioritaria. Verificar números de serie y condición del empaque al recibir.',
            'created_by' => $admin->id,
        ]);
        $po184->save();

        foreach ([
            [
                'product_variant_id' => $variantsBySku['APL-IP15P-256-BLK']->id,
                'quantity_ordered' => 24,
                'quantity_received' => 18,
                'unit_cost' => 965.00,
            ],
            [
                'product_variant_id' => $variantsBySku['APL-APP2-USB-C-WHT']->id,
                'quantity_ordered' => 20,
                'quantity_received' => 20,
                'unit_cost' => 182.00,
            ],
            [
                'product_variant_id' => $variantsBySku['ANK-CHG-65W-BLK']->id,
                'quantity_ordered' => 40,
                'quantity_received' => 0,
                'unit_cost' => 41.50,
            ],
        ] as $row) {
            (new PurchaseOrderItem)->forceFill(['purchase_order_id' => $po184->id] + $row)->save();
        }

        $po183 = (new PurchaseOrder)->forceFill([
            'number' => 'OC-2026-0183',
            'supplier_id' => $suppliers['PRV-0004']->id,
            'warehouse_id' => $warehouses['norte']->id,
            'status' => PurchaseOrderStatus::Sent,
            'expected_at' => now()->addDays(3)->toDateString(),
            'sent_at' => now()->subDays(5),
            'total' => 42180.00,
            'notes' => 'Reposición mensual para Sucursal Norte.',
            'created_by' => $admin->id,
        ]);
        $po183->save();

        foreach ([
            [
                'product_variant_id' => $variantsBySku['APL-MBA-M3-512-SLV']->id,
                'quantity_ordered' => 20,
                'quantity_received' => 0,
                'unit_cost' => 1210.00,
            ],
            [
                'product_variant_id' => $variantsBySku['APL-IP15P-128-NT']->id,
                'quantity_ordered' => 15,
                'quantity_received' => 0,
                'unit_cost' => 812.00,
            ],
            [
                'product_variant_id' => $variantsBySku['APL-IP15P-512-BLU']->id,
                'quantity_ordered' => 5,
                'quantity_received' => 0,
                'unit_cost' => 1160.00,
            ],
        ] as $row) {
            (new PurchaseOrderItem)->forceFill(['purchase_order_id' => $po183->id] + $row)->save();
        }

        $po182 = (new PurchaseOrder)->forceFill([
            'number' => 'OC-2026-0182',
            'supplier_id' => $suppliers['PRV-0011']->id,
            'warehouse_id' => $warehouses['fulfillment']->id,
            'status' => PurchaseOrderStatus::Received,
            'expected_at' => now()->subDays(2)->toDateString(),
            'sent_at' => now()->subDays(8),
            'received_at' => now()->subDays(2),
            'total' => 16840.00,
            'notes' => 'Orden recibida completa y auditada.',
            'created_by' => $manager->id,
        ]);
        $po182->save();

        foreach ([
            [
                'product_variant_id' => $variantsBySku['LEN-TPX1-I7-1TB']->id,
                'quantity_ordered' => 10,
                'quantity_received' => 10,
                'unit_cost' => 1420.00,
            ],
            [
                'product_variant_id' => $variantsBySku['LOG-MXM3S-GRY']->id,
                'quantity_ordered' => 41,
                'quantity_received' => 41,
                'unit_cost' => 64.39,
            ],
        ] as $row) {
            (new PurchaseOrderItem)->forceFill(['purchase_order_id' => $po182->id] + $row)->save();
        }

        activity('purchases')
            ->performedOn($po184)
            ->causedBy($admin)
            ->withProperties(['number' => 'OC-2026-0184', 'received_units' => 38, 'status' => 'partially_received'])
            ->log('Mercancía recibida (38 uds.) en orden OC-2026-0184');

        activity('purchases')
            ->performedOn($po183)
            ->causedBy($admin)
            ->withProperties(['number' => 'OC-2026-0183', 'total' => 42180.00, 'status' => 'sent'])
            ->log('Orden de compra creada: OC-2026-0183');

        activity('catalog')
            ->performedOn($suppliers['PRV-0018'])
            ->causedBy($admin)
            ->withProperties(['code' => 'PRV-0018', 'legal_name' => 'TechDistribution LLC'])
            ->log('Proveedor verificado con PII cifrada: TechDistribution LLC (PRV-0018)');
    }
}
