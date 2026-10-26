<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\MovementType;
use App\Enums\PurchaseOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ReceivePurchaseOrderRequest;
use App\Http\Requests\Api\V1\StorePurchaseOrderRequest;
use App\Http\Resources\Api\V1\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()?->can('purchase-orders.view'), 403);

        $orders = PurchaseOrder::query()
            ->with(['supplier', 'warehouse', 'creator', 'items.variant.product.images'])
            ->orderByDesc('number')
            ->get();

        return PurchaseOrderResource::collection($orders);
    }

    public function show(Request $request, PurchaseOrder $purchaseOrder): PurchaseOrderResource
    {
        abort_unless($request->user()?->can('purchase-orders.view'), 403);

        $purchaseOrder->load(['supplier', 'warehouse', 'creator', 'items.variant.product.images']);

        return new PurchaseOrderResource($purchaseOrder);
    }

    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $purchaseOrder = DB::transaction(function () use ($validated, $user): PurchaseOrder {
            $year = now()->format('Y');
            $lastOrder = PurchaseOrder::query()
                ->where('number', 'like', "OC-{$year}-%")
                ->orderByDesc('number')
                ->lockForUpdate()
                ->first();

            $nextSeq = 185;
            if ($lastOrder && preg_match('/OC-\d{4}-(\d+)/', $lastOrder->number, $matches)) {
                $nextSeq = ((int) $matches[1]) + 1;
            }
            $number = sprintf('OC-%s-%04d', $year, $nextSeq);

            $total = collect($validated['items'])->reduce(
                fn (float $carry, array $item) => $carry + ((int) $item['quantity_ordered'] * (float) $item['unit_cost']),
                0.0
            );

            $sendNow = $validated['send_now'] ?? true;

            $po = (new PurchaseOrder)->forceFill([
                'number' => $number,
                'supplier_id' => $validated['supplier_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'status' => $sendNow ? PurchaseOrderStatus::Sent : PurchaseOrderStatus::Draft,
                'expected_at' => $validated['expected_at'] ?? now()->addDays(6)->toDateString(),
                'sent_at' => $sendNow ? now() : null,
                'total' => round($total, 2),
                'notes' => $validated['notes'] ?? null,
                'created_by' => $user->id,
            ]);
            $po->save();

            foreach ($validated['items'] as $item) {
                $po->items()->create([
                    'product_variant_id' => $item['product_variant_id'],
                    'quantity_ordered' => (int) $item['quantity_ordered'],
                    'unit_cost' => (float) $item['unit_cost'],
                ]);
            }

            activity('purchases')
                ->performedOn($po)
                ->causedBy($user)
                ->withProperties([
                    'number' => $po->number,
                    'total' => (float) $po->total,
                    'status' => $po->status->value,
                ])
                ->log("Orden de compra creada: {$po->number}");

            return $po->load(['supplier', 'warehouse', 'creator', 'items.variant.product.images']);
        });

        return (new PurchaseOrderResource($purchaseOrder))
            ->response()
            ->setStatusCode(201);
    }

    public function receive(
        ReceivePurchaseOrderRequest $request,
        PurchaseOrder $purchaseOrder,
        StockService $stockService
    ): PurchaseOrderResource {
        $validated = $request->validated();
        $user = $request->user();

        $updatedOrder = DB::transaction(function () use ($validated, $purchaseOrder, $stockService, $user): PurchaseOrder {
            /** @var PurchaseOrder $po */
            $po = PurchaseOrder::query()
                ->whereKey($purchaseOrder->id)
                ->lockForUpdate()
                ->firstOrFail();

            $po->load(['warehouse', 'items.variant']);

            if (in_array($po->status, [PurchaseOrderStatus::Received, PurchaseOrderStatus::Cancelled], true)) {
                throw ValidationException::withMessages([
                    'status' => ["La orden {$po->number} ya se encuentra en estado {$po->status->value} y no admite nuevas recepciones."],
                ]);
            }

            $totalReceivedNow = 0;

            foreach ($validated['items'] as $entry) {
                $qty = (int) $entry['quantity_received'];
                if ($qty <= 0) {
                    continue;
                }

                $item = $po->items->firstWhere('id', $entry['item_id']);
                if (! $item) {
                    throw ValidationException::withMessages([
                        'items' => ['Uno de los renglones indicados no pertenece a esta orden de compra.'],
                    ]);
                }

                if ($qty > $item->pending) {
                    throw ValidationException::withMessages([
                        'items' => ["La cantidad a recibir ({$qty}) supera el pendiente ({$item->pending}) para el SKU {$item->variant->sku}."],
                    ]);
                }

                $item->forceFill([
                    'quantity_received' => $item->quantity_received + $qty,
                ])->save();

                $stockService->recordMovement(
                    variant: $item->variant,
                    warehouse: $po->warehouse,
                    type: MovementType::PurchaseReceipt,
                    quantity: $qty,
                    user: $user,
                    reference: $po->number,
                    reason: "Recepción de orden de compra {$po->number}",
                    purchaseOrderId: $po->id,
                );

                $totalReceivedNow += $qty;
            }

            if ($totalReceivedNow === 0) {
                throw ValidationException::withMessages([
                    'items' => ['Debes indicar al menos una cantidad mayor a cero para registrar la recepción.'],
                ]);
            }

            $po->load('items');
            $allCompleted = $po->items->every(fn ($i) => $i->pending <= 0);

            $po->forceFill([
                'status' => $allCompleted ? PurchaseOrderStatus::Received : PurchaseOrderStatus::PartiallyReceived,
                'sent_at' => $po->sent_at ?? now(),
                'received_at' => $allCompleted ? now() : $po->received_at,
            ])->save();

            activity('purchases')
                ->performedOn($po)
                ->causedBy($user)
                ->withProperties([
                    'number' => $po->number,
                    'received_units' => $totalReceivedNow,
                    'status' => $po->status->value,
                ])
                ->log("Mercancía recibida ({$totalReceivedNow} uds.) en orden {$po->number}");

            return $po->load(['supplier', 'warehouse', 'creator', 'items.variant.product.images']);
        });

        return new PurchaseOrderResource($updatedOrder);
    }
}
