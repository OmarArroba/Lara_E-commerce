<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\MovementType;
use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreProductRequest;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Resources\Api\V1\StockMovementResource;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()?->can('products.view'), 403);

        $query = Product::query()
            ->with(['category', 'brand', 'supplier', 'images', 'variants.stocks.warehouse'])
            ->latest('created_at');

        if ($search = trim((string) $request->query('q', ''))) {
            $term = '%'.strtolower($search).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(base_sku) LIKE ?', [$term])
                    ->orWhereHas('brand', fn ($bq) => $bq->whereRaw('LOWER(name) LIKE ?', [$term]))
                    ->orWhereHas('variants', fn ($vq) => $vq->whereRaw('LOWER(sku) LIKE ?', [$term]));
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($brandId = $request->query('brand_id')) {
            $query->where('brand_id', $brandId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return ProductResource::collection($query->get());
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        abort_unless($request->user()?->can('products.view'), 403);

        $product->load(['category', 'brand', 'supplier', 'images', 'variants.stocks.warehouse']);

        $variantIds = $product->variants->pluck('id');

        $movements = StockMovement::query()
            ->with(['variant.product', 'warehouse', 'relatedWarehouse', 'user'])
            ->whereIn('product_variant_id', $variantIds)
            ->latest('created_at')
            ->limit(25)
            ->get();

        return response()->json([
            'data' => [
                'product' => new ProductResource($product),
                'movements' => StockMovementResource::collection($movements),
            ],
        ]);
    }

    public function store(StoreProductRequest $request, StockService $stockService): ProductResource
    {
        $validated = $request->validated();
        $user = $request->user();

        $product = DB::transaction(function () use ($validated, $user, $stockService): Product {
            $slug = Str::slug($validated['name']);
            if (Product::withTrashed()->where('slug', $slug)->exists()) {
                $slug .= '-'.strtolower(Str::random(4));
            }

            $product = Product::create([
                'category_id' => $validated['category_id'],
                'brand_id' => $validated['brand_id'],
                'supplier_id' => $validated['supplier_id'] ?? null,
                'name' => $validated['name'],
                'slug' => $slug,
                'base_sku' => strtoupper($validated['base_sku']),
                'barcode' => $validated['barcode'] ?? null,
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? ProductStatus::Active->value,
            ]);

            if (! empty($validated['image'])) {
                $product->images()->create([
                    'path' => $validated['image'],
                    'position' => 0,
                ]);
            }

            $defaultWarehouse = ! empty($validated['initial_warehouse_id'])
                ? Warehouse::find($validated['initial_warehouse_id'])
                : Warehouse::orderBy('code')->first();

            foreach ($validated['variants'] as $vData) {
                $variant = $product->variants()->create([
                    'sku' => strtoupper($vData['sku']),
                    'color' => $vData['color'] ?? null,
                    'storage' => $vData['storage'] ?? null,
                    'price' => $vData['price'],
                    'cost' => $vData['cost'],
                    'min_stock' => $vData['min_stock'] ?? 8,
                    'is_active' => true,
                ]);

                $initialStock = (int) ($vData['initial_stock'] ?? 0);
                if ($initialStock > 0 && $defaultWarehouse !== null && $user !== null) {
                    $stockService->recordMovement(
                        variant: $variant,
                        warehouse: $defaultWarehouse,
                        type: MovementType::In,
                        quantity: $initialStock,
                        user: $user,
                        reference: 'INIT-'.$variant->sku,
                        reason: 'Stock inicial al crear producto',
                    );
                }
            }

            activity('catalog')
                ->performedOn($product)
                ->causedBy($user)
                ->withProperties([
                    'base_sku' => $product->base_sku,
                    'name' => $product->name,
                    'variants_count' => count($validated['variants']),
                ])
                ->log("Producto creado: {$product->name} ({$product->base_sku})");

            return $product->load(['category', 'brand', 'supplier', 'images', 'variants.stocks.warehouse']);
        });

        return new ProductResource($product);
    }
}
