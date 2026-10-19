<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('parent_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // FK autorreferenciada: en PostgreSQL debe crearse cuando la PK ya existe.
        Schema::table('categories', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('categories')->restrictOnDelete();
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code', 10)->unique();
            $table->string('website')->nullable();
            $table->string('logo_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('suppliers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code', 20)->unique();
            $table->string('legal_name');
            $table->string('trade_name')->nullable();
            $table->text('tax_id')->nullable(); // cifrado
            $table->string('website')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_position')->nullable();
            $table->text('contact_email')->nullable(); // cifrado
            $table->text('contact_phone')->nullable(); // cifrado
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 2)->default('US');
            $table->string('currency', 3)->default('USD');
            $table->string('payment_terms')->default('NET 30');
            $table->string('lead_time')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('category_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('brand_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('base_sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('draft')->index(); // ProductStatus
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'brand_id']);
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('color')->nullable();
            $table->string('storage')->nullable();
            $table->jsonb('attributes')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('cost', 12, 2);
            $table->unsignedInteger('min_stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['product_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
    }
};
