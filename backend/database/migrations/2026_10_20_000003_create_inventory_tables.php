<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('capacity_units')->nullable();
            $table->string('status', 20)->default('operational'); // WarehouseStatus
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('stocks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_variant_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('warehouse_id')->constrained()->restrictOnDelete();
            $table->integer('quantity')->default(0);
            $table->integer('reserved')->default(0);
            $table->timestamps();

            $table->unique(['product_variant_id', 'warehouse_id']);
        });

        // El stock nunca puede ser negativo ni la reserva superar la cantidad.
        DB::statement('ALTER TABLE stocks ADD CONSTRAINT stocks_quantity_non_negative CHECK (quantity >= 0)');
        DB::statement('ALTER TABLE stocks ADD CONSTRAINT stocks_reserved_valid CHECK (reserved >= 0 AND reserved <= quantity)');

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('number')->unique();
            $table->foreignUlid('supplier_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('warehouse_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('draft')->index(); // PurchaseOrderStatus
            $table->date('expected_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->decimal('total', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('product_variant_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('quantity_ordered');
            $table->unsignedInteger('quantity_received')->default(0);
            $table->decimal('unit_cost', 12, 2);
            $table->timestamps();

            $table->unique(['purchase_order_id', 'product_variant_id']);
        });

        // Libro de movimientos: solo se agregan filas, nunca se editan ni se borran.
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_variant_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('warehouse_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('related_warehouse_id')->nullable()->constrained('warehouses')->restrictOnDelete();
            $table->string('type', 20)->index(); // MovementType
            $table->integer('quantity'); // con signo: positivo entra, negativo sale
            $table->integer('balance_after');
            $table->string('reference')->nullable();
            $table->text('reason')->nullable();
            $table->foreignUlid('purchase_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['product_variant_id', 'warehouse_id', 'created_at']);
            $table->index('created_at');
        });

        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE FUNCTION forbid_stock_movement_changes() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'stock_movements es un libro de solo-agregar: no se permite % ', TG_OP;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER stock_movements_append_only
                BEFORE UPDATE OR DELETE ON stock_movements
                FOR EACH ROW EXECUTE FUNCTION forbid_stock_movement_changes();
        SQL);
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS stock_movements_append_only ON stock_movements; DROP FUNCTION IF EXISTS forbid_stock_movement_changes();');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('warehouses');
    }
};
