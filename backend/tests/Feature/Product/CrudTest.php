<?php

use App\Models\Product;
use App\Models\User;
use App\ScopeEnum;

test('unauthenticated user cannot access products', function () {
    $response = $this->getJson('/api/products');

    $response->assertStatus(401);
});

test('authenticated user can list products', function () {
    Product::factory(3)->create();

    $response = $this->actingAsGuest()->getJson('/api/products');

    $response->assertStatus(200);
    expect(count($response->json('products')))->toBe(3);
});

test('authenticated user can view single product', function () {
    $product = Product::factory()->create();

    $response = $this->actingAsGuest()->getJson("/api/products/{$product->id}");

    $response->assertStatus(200);
    expect($response->json('name'))->toBe($product->name);
});

test('user role cannot create product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::USER,
    ]);

    $response = $this->actingAs($user)->postJson('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'imageURL' => 'https://example.com/image.jpg',
        'last30DaysPrice' => 34.99,
    ]);

    $response->assertStatus(403);
});

test('user role cannot update product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::USER,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($user)->putJson("/api/products/{$product->id}", [
        'name' => 'Updated Product',
    ]);

    $response->assertStatus(403);
});

test('user role cannot delete product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::USER,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($user)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(403);
});

test('admin can create product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($user)->postJson('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'imageURL' => 'https://example.com/image.jpg',
        'last30DaysPrice' => 34.99,
    ]);

    $response->assertStatus(201);
    expect($response->json('name'))->toBe('Test Product');
    expect(Product::count())->toBe(1);
});

test('admin can update product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($user)->putJson("/api/products/{$product->id}", [
        'name' => 'Updated Product',
    ]);

    $response->assertStatus(200);
    expect($response->json('name'))->toBe('Updated Product');
});

test('admin can delete product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($user)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(204);
    expect(Product::count())->toBe(0);
});

test('vendor can create product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($user)->postJson('/api/products', [
        'name' => 'Vendor Product',
        'description' => 'Vendor Description',
        'price' => 49.99,
        'imageURL' => 'https://example.com/vendor.jpg',
        'last30DaysPrice' => 54.99,
    ]);

    $response->assertStatus(201);
    expect($response->json('name'))->toBe('Vendor Product');
});

test('vendor can update product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($user)->putJson("/api/products/{$product->id}", [
        'name' => 'Updated Vendor Product',
    ]);

    $response->assertStatus(200);
    expect($response->json('name'))->toBe('Updated Vendor Product');
});

test('vendor can delete product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($user)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(204);
    expect(Product::count())->toBe(0);
});

test('superadmin can create product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::SUPERADMIN,
    ]);

    $response = $this->actingAs($user)->postJson('/api/products', [
        'name' => 'Superadmin Product',
        'description' => 'Superadmin Description',
        'price' => 99.99,
        'imageURL' => 'https://example.com/superadmin.jpg',
        'last30DaysPrice' => 109.99,
    ]);

    $response->assertStatus(201);
    expect($response->json('name'))->toBe('Superadmin Product');
});

test('superadmin can update product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::SUPERADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($user)->putJson("/api/products/{$product->id}", [
        'name' => 'Updated Superadmin Product',
    ]);

    $response->assertStatus(200);
    expect($response->json('name'))->toBe('Updated Superadmin Product');
});

test('superadmin can delete product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::SUPERADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($user)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(204);
    expect(Product::count())->toBe(0);
});

test('support role cannot create product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::SUPPORT,
    ]);

    $response = $this->actingAs($user)->postJson('/api/products', [
        'name' => 'Support Product',
        'description' => 'Support Description',
        'price' => 19.99,
        'imageURL' => 'https://example.com/support.jpg',
        'last30DaysPrice' => 24.99,
    ]);

    $response->assertStatus(403);
});

test('create product validation errors', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($user)->postJson('/api/products', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name', 'description', 'price', 'imageURL']);
});

test('update product validation errors', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($user)->putJson("/api/products/{$product->id}", [
        'price' => -10,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['price']);
});
