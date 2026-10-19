<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\MovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreStockMovementRequest;
use App\Http\Resources\Api\V1\StockMovementResource;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StockMovementController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()?->can('stock.view'), 403);

        $query = StockMovement::query()
            ->with(['variant.product', 'warehouse', 'relatedWarehouse', 'user'])
            ->latest('created_at');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($warehouseId = $request->query('warehouse_id')) {
            $query->where('warehouse_id', $warehouseId);
        }

        if ($search = trim((string) $request->query('q', ''))) {
            $term = '%'.strtolower($search).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(COALESCE(reference, \'\')) LIKE ?', [$term])
                    ->orWhereHas('variant', function ($vq) use ($term) {
                        $vq->whereRaw('LOWER(sku) LIKE ?', [$term])
                            ->orWhereHas('product', fn ($pq) => $pq->whereRaw('LOWER(name) LIKE ?', [$term]));
                    });
            });
        }

        return StockMovementResource::collection($query->limit(100)->get());
    }

    public function store(StoreStockMovementRequest $request, StockService $stockService): StockMovementResource
    {
        $validated = $request->validated();
        $user = $request->user();

        $variant = ProductVariant::findOrFail($validated['product_variant_id']);
        $warehouse = Warehouse::findOrFail($validated['warehouse_id']);

        if ($validated['type'] === 'transfer') {
            $toWarehouse = Warehouse::findOrFail($validated['to_warehouse_id']);
            $result = $stockService->transfer(
                variant: $variant,
                fromWarehouse: $warehouse,
                toWarehouse: $toWarehouse,
                quantity: (int) $validated['quantity'],
                user: $user,
                reference: $validated['reference'] ?? null,
                reason: $validated['reason'] ?? null,
            );

            $movement = $result['out'];
        } else {
            $movement = $stockService->recordMovement(
                variant: $variant,
                warehouse: $warehouse,
                type: MovementType::from($validated['type']),
                quantity: (int) $validated['quantity'],
                user: $user,
                reference: $validated['reference'] ?? null,
                reason: $validated['reason'] ?? null,
            );
        }

        return new StockMovementResource(
            $movement->load(['variant.product', 'warehouse', 'relatedWarehouse', 'user'])
        );
    }
}
