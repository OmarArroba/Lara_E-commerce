<?php

namespace App\Services;

use App\Enums\MovementType;
use App\Models\ProductVariant;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    /**
     * Registra un movimiento de stock individual (entrada, salida, ajuste, devolución o recepción OC)
     * dentro de una transacción con bloqueo de fila (SELECT ... FOR UPDATE).
     */
    public function recordMovement(
        ProductVariant $variant,
        Warehouse $warehouse,
        MovementType $type,
        int $quantity,
        User $user,
        ?string $reference = null,
        ?string $reason = null,
        ?string $purchaseOrderId = null,
    ): StockMovement {
        if (in_array($type, [MovementType::TransferIn, MovementType::TransferOut], true)) {
            throw ValidationException::withMessages([
                'type' => ['Usa el método transfer() para transferencias entre almacenes.'],
            ]);
        }

        if ($quantity === 0) {
            throw ValidationException::withMessages([
                'quantity' => ['La cantidad del movimiento no puede ser cero.'],
            ]);
        }

        if ($type !== MovementType::Adjustment && $quantity < 0) {
            throw ValidationException::withMessages([
                'quantity' => ['La cantidad debe ser un entero positivo.'],
            ]);
        }

        $signedDelta = match ($type) {
            MovementType::In, MovementType::Return, MovementType::PurchaseReceipt => abs($quantity),
            MovementType::Out => -abs($quantity),
            MovementType::Adjustment => $quantity,
        };

        return DB::transaction(function () use (
            $variant,
            $warehouse,
            $type,
            $signedDelta,
            $user,
            $reference,
            $reason,
            $purchaseOrderId
        ): StockMovement {
            $stock = $this->lockOrCreateStock($variant->id, $warehouse->id);

            $newQuantity = $stock->quantity + $signedDelta;
            $availableAfter = $newQuantity - $stock->reserved;

            if ($newQuantity < 0 || $availableAfter < 0) {
                throw ValidationException::withMessages([
                    'quantity' => [
                        "Stock disponible insuficiente en {$warehouse->name} (disponible: {$stock->available}, solicitado: ".abs($signedDelta).').',
                    ],
                ]);
            }

            $stock->forceFill(['quantity' => $newQuantity])->save();

            $movement = (new StockMovement)->forceFill([
                'product_variant_id' => $variant->id,
                'warehouse_id' => $warehouse->id,
                'type' => $type,
                'quantity' => $signedDelta,
                'balance_after' => $newQuantity,
                'reference' => $reference,
                'reason' => $reason,
                'purchase_order_id' => $purchaseOrderId,
                'user_id' => $user->id,
            ]);
            $movement->save();

            if ($type->isSensitive()) {
                activity('inventory')
                    ->performedOn($movement)
                    ->causedBy($user)
                    ->withProperties([
                        'sku' => $variant->sku,
                        'warehouse' => $warehouse->code,
                        'type' => $type->value,
                        'quantity' => $signedDelta,
                        'balance_after' => $newQuantity,
                        'reference' => $reference,
                        'reason' => $reason,
                    ])
                    ->log("Movimiento sensible registrado ({$type->value}) para SKU {$variant->sku}");
            }

            return $movement;
        });
    }

    /**
     * Transfiere existencias entre dos almacenes de forma atómica,
     * bloqueando las filas en orden determinístico de ULID para evitar interbloqueos (deadlocks).
     *
     * @return array{out: StockMovement, in: StockMovement}
     */
    public function transfer(
        ProductVariant $variant,
        Warehouse $fromWarehouse,
        Warehouse $toWarehouse,
        int $quantity,
        User $user,
        ?string $reference = null,
        ?string $reason = null,
    ): array {
        if ($fromWarehouse->id === $toWarehouse->id) {
            throw ValidationException::withMessages([
                'to_warehouse_id' => ['El almacén de destino debe ser distinto al de origen.'],
            ]);
        }

        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => ['La cantidad a transferir debe ser mayor que cero.'],
            ]);
        }

        return DB::transaction(function () use (
            $variant,
            $fromWarehouse,
            $toWarehouse,
            $quantity,
            $user,
            $reference,
            $reason
        ): array {
            // Orden determinístico de bloqueo para evitar deadlocks entre transacciones concurrentes.
            $warehouseIds = [$fromWarehouse->id, $toWarehouse->id];
            sort($warehouseIds);

            $locks = [];
            foreach ($warehouseIds as $wId) {
                $locks[$wId] = $this->lockOrCreateStock($variant->id, $wId);
            }

            $originStock = $locks[$fromWarehouse->id];
            $destStock = $locks[$toWarehouse->id];

            if ($originStock->available < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => [
                        "Stock disponible insuficiente en {$fromWarehouse->name} (disponible: {$originStock->available}, solicitado: {$quantity}).",
                    ],
                ]);
            }

            $originBalance = $originStock->quantity - $quantity;
            $destBalance = $destStock->quantity + $quantity;

            $originStock->forceFill(['quantity' => $originBalance])->save();
            $destStock->forceFill(['quantity' => $destBalance])->save();

            $outMovement = (new StockMovement)->forceFill([
                'product_variant_id' => $variant->id,
                'warehouse_id' => $fromWarehouse->id,
                'related_warehouse_id' => $toWarehouse->id,
                'type' => MovementType::TransferOut,
                'quantity' => -$quantity,
                'balance_after' => $originBalance,
                'reference' => $reference,
                'reason' => $reason,
                'user_id' => $user->id,
            ]);
            $outMovement->save();

            $inMovement = (new StockMovement)->forceFill([
                'product_variant_id' => $variant->id,
                'warehouse_id' => $toWarehouse->id,
                'related_warehouse_id' => $fromWarehouse->id,
                'type' => MovementType::TransferIn,
                'quantity' => $quantity,
                'balance_after' => $destBalance,
                'reference' => $reference,
                'reason' => $reason,
                'user_id' => $user->id,
            ]);
            $inMovement->save();

            return ['out' => $outMovement, 'in' => $inMovement];
        });
    }

    /**
     * Obtiene y bloquea (FOR UPDATE) el registro de stock para (variante, almacén),
     * creándolo con saldo 0 si aún no existe.
     */
    private function lockOrCreateStock(string $variantId, string $warehouseId): Stock
    {
        $stock = Stock::query()
            ->where('product_variant_id', $variantId)
            ->where('warehouse_id', $warehouseId)
            ->lockForUpdate()
            ->first();

        if ($stock !== null) {
            return $stock;
        }

        Stock::firstOrCreate([
            'product_variant_id' => $variantId,
            'warehouse_id' => $warehouseId,
        ]);

        return Stock::query()
            ->where('product_variant_id', $variantId)
            ->where('warehouse_id', $warehouseId)
            ->lockForUpdate()
            ->firstOrFail();
    }
}
