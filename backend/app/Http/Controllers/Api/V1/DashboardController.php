<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Resources\Api\V1\StockMovementResource;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $inventoryValue = (float) DB::table('stocks')
            ->join('product_variants', 'stocks.product_variant_id', '=', 'product_variants.id')
            ->selectRaw('COALESCE(SUM(stocks.quantity * product_variants.cost), 0) as total_value')
            ->value('total_value');

        $activeProductsCount = Product::where('status', ProductStatus::Active)->count();

        $products = Product::query()
            ->with(['category', 'brand', 'supplier', 'images', 'variants.stocks.warehouse'])
            ->where('status', ProductStatus::Active)
            ->get();

        $lowStockProducts = $products->filter(function (Product $p): bool {
            $totalStock = $p->variants->sum(fn ($v) => $v->stocks->sum('quantity'));
            $threshold = $p->variants->max('min_stock') ?? 8;

            return $totalStock < $threshold;
        })->values();

        $todayStart = now()->startOfDay();
        $movementsToday = StockMovement::where('created_at', '>=', $todayStart)->get();

        $recentMovements = StockMovement::query()
            ->with(['variant.product', 'warehouse', 'relatedWarehouse', 'user'])
            ->latest('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'kpis' => [
                    'inventory_value' => round($inventoryValue, 2),
                    'active_products' => $activeProductsCount,
                    'low_stock_count' => $lowStockProducts->count(),
                    'movements_today' => $movementsToday->count(),
                    'entries_today' => $movementsToday->where('quantity', '>', 0)->count(),
                    'exits_today' => $movementsToday->where('quantity', '<', 0)->count(),
                ],
                'low_stock_alerts' => ProductResource::collection($lowStockProducts->take(6)),
                'recent_movements' => StockMovementResource::collection($recentMovements),
            ],
        ]);
    }
}
