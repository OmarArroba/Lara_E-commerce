<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\WarehouseStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreWarehouseRequest;
use App\Http\Requests\Api\V1\UpdateWarehouseRequest;
use App\Http\Resources\Api\V1\WarehouseResource;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WarehouseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()?->can('warehouses.view'), 403);

        $warehouses = Warehouse::query()
            ->with('manager')
            ->withSum('stocks as total_units', 'quantity')
            ->withCount('stocks as distinct_variants')
            ->orderBy('code')
            ->get();

        return WarehouseResource::collection($warehouses);
    }

    public function show(Request $request, Warehouse $warehouse): JsonResponse
    {
        abort_unless($request->user()?->can('warehouses.view'), 403);

        $warehouse->load([
            'manager',
            'stocks' => fn ($q) => $q->with(['variant.product.category', 'variant.product.images'])->where('quantity', '>', 0),
        ]);
        $warehouse->loadSum('stocks as total_units', 'quantity');
        $warehouse->loadCount('stocks as distinct_variants');

        return response()->json([
            'data' => [
                'warehouse' => new WarehouseResource($warehouse),
                'stocks' => $warehouse->stocks->map(fn ($stock) => [
                    'id' => $stock->id,
                    'quantity' => $stock->quantity,
                    'reserved' => $stock->reserved,
                    'available' => $stock->available,
                    'variant' => [
                        'id' => $stock->variant->id,
                        'sku' => $stock->variant->sku,
                        'price' => (float) $stock->variant->price,
                        'cost' => (float) $stock->variant->cost,
                        'min_stock' => $stock->variant->min_stock,
                        'product_id' => $stock->variant->product->id,
                        'product_name' => $stock->variant->product->name,
                        'category' => $stock->variant->product->category?->name,
                        'image' => $stock->variant->product->images->first()?->path,
                    ],
                ]),
            ],
        ]);
    }

    public function store(StoreWarehouseRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $warehouse = Warehouse::create([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'manager_id' => $validated['manager_id'] ?? $request->user()?->id,
            'capacity_units' => $validated['capacity_units'] ?? 5000,
            'status' => $validated['status'] ?? WarehouseStatus::Operational->value,
        ]);

        $warehouse->load('manager');
        $warehouse->loadSum('stocks as total_units', 'quantity');
        $warehouse->loadCount('stocks as distinct_variants');

        activity('inventory')
            ->performedOn($warehouse)
            ->causedBy($request->user())
            ->withProperties([
                'code' => $warehouse->code,
                'name' => $warehouse->name,
                'status' => $warehouse->status->value,
            ])
            ->log("Almacén creado: {$warehouse->name} ({$warehouse->code})");

        return (new WarehouseResource($warehouse))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse): WarehouseResource
    {
        $validated = $request->validated();

        $warehouse->fill($validated)->save();

        $warehouse->load('manager');
        $warehouse->loadSum('stocks as total_units', 'quantity');
        $warehouse->loadCount('stocks as distinct_variants');

        activity('inventory')
            ->performedOn($warehouse)
            ->causedBy($request->user())
            ->withProperties([
                'code' => $warehouse->code,
                'name' => $warehouse->name,
                'status' => $warehouse->status->value,
            ])
            ->log("Almacén actualizado: {$warehouse->name} ({$warehouse->code})");

        return new WarehouseResource($warehouse);
    }
}
