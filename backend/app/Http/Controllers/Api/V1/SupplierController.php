<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreSupplierRequest;
use App\Http\Resources\Api\V1\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SupplierController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()?->can('suppliers.view'), 403);

        $suppliers = Supplier::query()
            ->withCount(['products', 'purchaseOrders'])
            ->withSum('purchaseOrders as total_purchased', 'total')
            ->orderBy('code')
            ->get();

        return SupplierResource::collection($suppliers);
    }

    public function show(Request $request, Supplier $supplier): SupplierResource
    {
        abort_unless($request->user()?->can('suppliers.view'), 403);

        $supplier->loadCount(['products', 'purchaseOrders']);
        $supplier->loadSum('purchaseOrders as total_purchased', 'total');

        return new SupplierResource($supplier);
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $supplier = Supplier::create([
            'code' => strtoupper($validated['code']),
            'legal_name' => $validated['legal_name'],
            'trade_name' => $validated['trade_name'] ?? $validated['legal_name'],
            'tax_id' => $validated['tax_id'] ?? null,
            'website' => $validated['website'] ?? null,
            'contact_name' => $validated['contact_name'] ?? null,
            'contact_position' => $validated['contact_position'] ?? null,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'country' => strtoupper($validated['country'] ?? 'US'),
            'currency' => strtoupper($validated['currency'] ?? 'USD'),
            'payment_terms' => $validated['payment_terms'] ?? 'NET 30',
            'lead_time' => $validated['lead_time'] ?? '5-7 días',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $supplier->loadCount(['products', 'purchaseOrders']);
        $supplier->loadSum('purchaseOrders as total_purchased', 'total');

        activity('catalog')
            ->performedOn($supplier)
            ->causedBy($request->user())
            ->withProperties([
                'code' => $supplier->code,
                'legal_name' => $supplier->legal_name,
            ])
            ->log("Proveedor creado: {$supplier->legal_name} ({$supplier->code})");

        return (new SupplierResource($supplier))
            ->response()
            ->setStatusCode(201);
    }
}
