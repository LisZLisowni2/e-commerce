<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\ScopeEnum;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->when($request->has('vendor_id'), fn ($query) => $query->where('vendor_id', $request->integer('vendor_id')))
            ->get();

        return response()->json(["products" => $products]);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['required', 'image'],
            'last30DaysPrice' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'vendor_id' => $this->isManager($request)
                ? ['required', 'integer', Rule::exists('users', 'id')->where('scope', ScopeEnum::VENDOR->value)]
                : ['prohibited'],
            'category_id' => ['required', 'integer']
        ]);

        $data['vendor_id'] ??= $request->user()->id;

        $path = Storage::putFile('', $data['image']);
        unset($data['image']);
        $data['imageURL'] = $path;

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $this->authorizeProduct($request, $product);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'image' => ['sometimes', 'image'],
            'last30DaysPrice' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['sometimes', 'integer', 'min:0'],
            'vendor_id' => $this->isManager($request)
                ? ['sometimes', 'integer', Rule::exists('users', 'id')->where('scope', ScopeEnum::VENDOR->value)]
                : ['prohibited'],
            'category_id' => ['sometimes', 'integer']
        ]);

        if (isset($data['image'])) {
            $path = Storage::putFile('', $data['image']);
            unset($data['image']);
            $data['imageURL'] = Storage::url($path);
        }
        
        $product->update($data);

        return response()->json($product);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->authorizeProduct($request, $product);

        $product->delete();

        return response()->json(null, 204);
    }

    private function isManager(Request $request): bool
    {
        return in_array($request->user()->scope, [ScopeEnum::ADMIN, ScopeEnum::SUPERADMIN], true);
    }

    private function authorizeProduct(Request $request, Product $product): void
    {
        if (! $this->isManager($request) && $product->vendor_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this resource.');
        }
    }
}
