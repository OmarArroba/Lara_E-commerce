<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Stock;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('reports.view'), 403);

        $totals = DB::table('stocks')
            ->join('product_variants', 'stocks.product_variant_id', '=', 'product_variants.id')
            ->selectRaw('
                COALESCE(SUM(stocks.quantity), 0) as total_units,
                COALESCE(SUM(stocks.quantity * product_variants.cost), 0) as total_cost_value,
                COALESCE(SUM(stocks.quantity * product_variants.price), 0) as total_retail_value
            ')
            ->first();

        $totalUnits = (int) ($totals->total_units ?? 0);
        $totalCost = round((float) ($totals->total_cost_value ?? 0), 2);
        $totalRetail = round((float) ($totals->total_retail_value ?? 0), 2);
        $marginPercent = $totalRetail > 0
            ? round((($totalRetail - $totalCost) / $totalRetail) * 100, 1)
            : 0.0;

        $byCategory = DB::table('stocks')
            ->join('product_variants', 'stocks.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->groupBy('categories.id', 'categories.name')
            ->selectRaw('
                categories.id as category_id,
                categories.name as category_name,
                COALESCE(SUM(stocks.quantity), 0) as units,
                COALESCE(SUM(stocks.quantity * product_variants.cost), 0) as cost_value,
                COALESCE(SUM(stocks.quantity * product_variants.price), 0) as retail_value
            ')
            ->orderByDesc('cost_value')
            ->get()
            ->map(fn ($row) => [
                'category_id' => $row->category_id,
                'category_name' => $row->category_name,
                'units' => (int) $row->units,
                'cost_value' => round((float) $row->cost_value, 2),
                'retail_value' => round((float) $row->retail_value, 2),
            ])
            ->values();

        $byWarehouse = DB::table('warehouses')
            ->leftJoin('stocks', 'warehouses.id', '=', 'stocks.warehouse_id')
            ->leftJoin('product_variants', 'stocks.product_variant_id', '=', 'product_variants.id')
            ->whereNull('warehouses.deleted_at')
            ->groupBy('warehouses.id', 'warehouses.code', 'warehouses.name', 'warehouses.city')
            ->selectRaw('
                warehouses.id as warehouse_id,
                warehouses.code as warehouse_code,
                warehouses.name as warehouse_name,
                warehouses.city as warehouse_city,
                COALESCE(SUM(stocks.quantity), 0) as units,
                COALESCE(SUM(stocks.quantity * product_variants.cost), 0) as cost_value,
                COALESCE(SUM(stocks.quantity * product_variants.price), 0) as retail_value
            ')
            ->orderBy('warehouses.code')
            ->get()
            ->map(fn ($row) => [
                'warehouse_id' => $row->warehouse_id,
                'warehouse_code' => $row->warehouse_code,
                'warehouse_name' => $row->warehouse_name,
                'warehouse_city' => $row->warehouse_city,
                'units' => (int) $row->units,
                'cost_value' => round((float) $row->cost_value, 2),
                'retail_value' => round((float) $row->retail_value, 2),
            ])
            ->values();

        return response()->json([
            'data' => [
                'summary' => [
                    'total_units' => $totalUnits,
                    'total_cost_value' => $totalCost,
                    'total_retail_value' => $totalRetail,
                    'estimated_profit' => round($totalRetail - $totalCost, 2),
                    'estimated_margin_percent' => $marginPercent,
                    'active_products' => Product::where('status', ProductStatus::Active)->count(),
                    'active_variants' => ProductVariant::where('is_active', true)->count(),
                    'active_warehouses' => Warehouse::count(),
                ],
                'by_category' => $byCategory,
                'by_warehouse' => $byWarehouse,
            ],
        ]);
    }

    public function export(Request $request): Response
    {
        abort_unless($request->user()?->can('reports.export'), 403);

        $stocks = Stock::query()
            ->with(['variant.product.category', 'variant.product.brand', 'warehouse'])
            ->orderBy('warehouse_id')
            ->get();

        $lines = [];
        $lines[] = implode(',', [
            'SKU',
            'Producto',
            'Categoria',
            'Marca',
            'Almacen_Codigo',
            'Almacen_Nombre',
            'Existencias',
            'Reservado',
            'Disponible',
            'Costo_Unitario_USD',
            'Precio_Venta_USD',
            'Valor_Costo_USD',
            'Valor_Venta_USD',
        ]);

        foreach ($stocks as $stock) {
            $variant = $stock->variant;
            $product = $variant?->product;
            $warehouse = $stock->warehouse;
            $cost = (float) ($variant?->cost ?? 0);
            $price = (float) ($variant?->price ?? 0);
            $qty = (int) $stock->quantity;

            $csvEscape = fn (?string $val): string => '"'.str_replace('"', '""', (string) $val).'"';

            $lines[] = implode(',', [
                $csvEscape($variant?->sku),
                $csvEscape($product?->name),
                $csvEscape($product?->category?->name),
                $csvEscape($product?->brand?->name),
                $csvEscape($warehouse?->code),
                $csvEscape($warehouse?->name),
                $qty,
                (int) $stock->reserved,
                (int) $stock->available,
                number_format($cost, 2, '.', ''),
                number_format($price, 2, '.', ''),
                number_format($qty * $cost, 2, '.', ''),
                number_format($qty * $price, 2, '.', ''),
            ]);
        }

        activity('reports')
            ->causedBy($request->user())
            ->withProperties(['rows_exported' => $stocks->count()])
            ->log("Reporte de inventario valorizado exportado a CSV ({$stocks->count()} registros)");

        // UTF-8 BOM (\xEF\xBB\xBF) para compatibilidad directa con Microsoft Excel
        $csvContent = "\xEF\xBB\xBF".implode("\r\n", $lines)."\r\n";

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="lara-inventario-valorizado.csv"',
        ]);
    }
}
