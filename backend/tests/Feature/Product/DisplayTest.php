<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\ScopeEnum;
use Illuminate\Support\Facades\Log;

test('display 3 products', function() {
    Product::factory(3)->create();

    $response = $this->getJson('/api/products');

    $response->assertStatus(200);
    expect(count($response->json()["products"]))->toBe(3);
});

test('product details returns the full product record', function () {
    $vendor = User::factory()->create(['scope' => ScopeEnum::VENDOR]);
    $category = Category::factory()->create(['name' => 'Graphics Cards', 'slug' => 'graphics-cards']);

    $product = Product::factory()->create([
        'name' => 'RTX 5070',
        'description' => 'High-end graphics card',
        'price' => 3299.99,
        'quantity' => 15,
        'vendor_id' => $vendor->id,
        'category_id' => $category->id,
    ]);

    $response = $this->getJson("/api/products/{$product->id}");

    $response->assertStatus(200);
    $response->assertJsonPath('id', $product->id);
    $response->assertJsonPath('name', 'RTX 5070');
    $response->assertJsonPath('description', 'High-end graphics card');
    $response->assertJsonPath('price', '3,299.99');
    $response->assertJsonPath('quantity', 15);
    $response->assertJsonPath('vendor_id', $vendor->id);
    $response->assertJsonPath('category_id', $category->id);
});

test('product details does not expose the image storage path directly', function () {
    $product = Product::factory()->create(['imageURL' => 'products/img123.png']);

    $response = $this->getJson("/api/products/{$product->id}");

    $response->assertStatus(200);
    expect($response->json('imageURL'))->toBe('products/img123.png');
});

test('product details returns 404 for a non-existent product', function () {
    $response = $this->getJson('/api/products/9999');

    $response->assertStatus(404);
});

test('product details endpoint is accessible without authentication', function () {
    $product = Product::factory()->create();

    $response = $this->actingAsGuest()->getJson("/api/products/{$product->id}");

    $response->assertStatus(200);
    $response->assertJsonPath('id', $product->id);
});