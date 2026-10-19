<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreCategoryRequest;
use App\Http\Resources\Api\V1\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()?->can('categories.view'), 403);

        $categories = Category::query()
            ->whereNull('parent_id')
            ->with([
                'children' => fn ($q) => $q->withCount('products')->orderBy('sort_order'),
            ])
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): CategoryResource
    {
        $data = $request->safe()->only(['parent_id', 'name', 'description', 'sort_order', 'is_active']);

        $slug = Str::slug($data['name']);
        if (Category::withTrashed()->where('slug', $slug)->exists()) {
            $slug .= '-'.strtolower(Str::random(4));
        }

        $category = Category::create([
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return new CategoryResource($category->load('children')->loadCount('products'));
    }
}
