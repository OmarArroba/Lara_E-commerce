<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));
        if ($term === '') {
            return response()->json([
                'data' => [
                    'products' => [],
                    'warehouses' => [],
                    'purchase_orders' => [],
                ],
            ]);
        }

        $like = '%'.strtolower($term).'%';

        $products = $request->user()?->can('products.view')
            ? Product::query()
                ->with(['variants', 'category'])
                ->where(function ($q) use ($like) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(base_sku) LIKE ?', [$like])
                        ->orWhereHas('variants', fn ($vq) => $vq->whereRaw('LOWER(sku) LIKE ?', [$like]));
                })
                ->limit(6)
                ->get()
                ->map(fn (Product $p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->variants->first()?->sku ?? $p->base_sku,
                    'category' => $p->category?->name,
                ])
                ->values()
            : collect();

        $warehouses = $request->user()?->can('warehouses.view')
            ? Warehouse::query()
                ->where(function ($q) use ($like) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(code) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(city, \'\')) LIKE ?', [$like]);
                })
                ->limit(4)
                ->get()
                ->map(fn (Warehouse $w) => [
                    'id' => $w->id,
                    'code' => $w->code,
                    'name' => $w->name,
                    'city' => $w->city,
                ])
                ->values()
            : collect();

        $purchaseOrders = $request->user()?->can('purchase-orders.view')
            ? PurchaseOrder::query()
                ->with('supplier')
                ->where(function ($q) use ($like) {
                    $q->whereRaw('LOWER(number) LIKE ?', [$like])
                        ->orWhereHas('supplier', fn ($sq) => $sq->whereRaw('LOWER(legal_name) LIKE ?', [$like]));
                })
                ->limit(4)
                ->get()
                ->map(fn (PurchaseOrder $po) => [
                    'id' => $po->id,
                    'number' => $po->number,
                    'supplier' => $po->supplier?->legal_name,
                    'status' => $po->status->value,
                    'total' => (float) $po->total,
                ])
                ->values()
            : collect();

        return response()->json([
            'data' => [
                'products' => $products,
                'warehouses' => $warehouses,
                'purchase_orders' => $purchaseOrders,
            ],
        ]);
    }
}
