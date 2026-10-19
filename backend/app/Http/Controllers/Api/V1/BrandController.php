<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreBrandRequest;
use App\Http\Resources\Api\V1\BrandResource;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()?->can('brands.view'), 403);

        $brands = Brand::query()
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return BrandResource::collection($brands);
    }

    public function store(StoreBrandRequest $request): BrandResource
    {
        $data = $request->safe()->only(['name', 'code', 'website', 'is_active']);

        $brand = Brand::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']).'-'.strtolower($data['code']),
            'code' => strtoupper($data['code']),
            'website' => $data['website'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return new BrandResource($brand->loadCount('products'));
    }
}
