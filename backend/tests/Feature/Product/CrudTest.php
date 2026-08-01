<?php

use App\Models\Product;
use App\Models\User;
use App\ScopeEnum;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('unauthenticated user can list products', function () {
    Product::factory(3)->create();

    $response = $this->actingAsGuest()->getJson('/api/products');

    $response->assertStatus(200);
    expect(count($response->json('products')))->toBe(3);
});

test('unauthenticated user can view single product', function () {
    $product = Product::factory()->create();

    $response = $this->actingAsGuest()->getJson("/api/products/{$product->id}");

    $response->assertStatus(200);
    expect($response->json('name'))->toBe($product->name);
});

test('products can be filtered by vendor', function () {
    $vendorA = User::factory()->create(['scope' => ScopeEnum::VENDOR]);
    $vendorB = User::factory()->create(['scope' => ScopeEnum::VENDOR]);

    Product::factory(2)->create(['vendor_id' => $vendorA->id]);
    Product::factory(3)->create(['vendor_id' => $vendorB->id]);

    $response = $this->getJson('/api/products?vendor_id=' . $vendorA->id);

    $response->assertStatus(200);
    expect(count($response->json('products')))->toBe(2);
});

test('user role cannot create product', function () {
    $user = User::factory()->create([
        'scope' => ScopeEnum::USER,
    ]);

    $response = $this->actingAs($user)->post('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'image' => UploadedFile::fake()->image('image.png'),
        'last30DaysPrice' => 34.99,
        'quantity' => 10,
    ], ['Accept' => 'application/json']);

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

test('admin can create product with a vendor', function () {
    Storage::fake('s3');

    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($admin)->post('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'image' => UploadedFile::fake()->image('image.png'),
        'last30DaysPrice' => 34.99,
        'quantity' => 10,
        'vendor_id' => $vendor->id,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(201);
    expect($response->json('name'))->toBe('Test Product');
    expect($response->json('vendor_id'))->toBe($vendor->id);
    expect($response->json('imageURL'))->toBeString();
    expect(Product::count())->toBe(1);
});

test('admin can create product without last30DaysPrice', function () {
    Storage::fake('s3');

    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($admin)->post('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'image' => UploadedFile::fake()->image('image.png'),
        'quantity' => 10,
        'vendor_id' => $vendor->id,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(201);
    expect($response->json('last30DaysPrice'))->toBeNull();
});

test('admin must provide a vendor id when creating a product', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($admin)->post('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'image' => UploadedFile::fake()->image('image.png'),
        'quantity' => 10,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['vendor_id']);
});

test('admin cannot assign a product to a non-vendor user', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $regularUser = User::factory()->create([
        'scope' => ScopeEnum::USER,
    ]);

    $response = $this->actingAs($admin)->post('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'image' => UploadedFile::fake()->image('image.png'),
        'quantity' => 10,
        'vendor_id' => $regularUser->id,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['vendor_id']);
});

test('admin can update product', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($admin)->putJson("/api/products/{$product->id}", [
        'name' => 'Updated Product',
    ]);

    $response->assertStatus(200);
    expect($response->json('name'))->toBe('Updated Product');
});

test('admin can reassign a product to another vendor', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $vendorA = User::factory()->create(['scope' => ScopeEnum::VENDOR]);
    $vendorB = User::factory()->create(['scope' => ScopeEnum::VENDOR]);

    $product = Product::factory()->create(['vendor_id' => $vendorA->id]);

    $response = $this->actingAs($admin)->putJson("/api/products/{$product->id}", [
        'vendor_id' => $vendorB->id,
    ]);

    $response->assertStatus(200);
    expect($response->json('vendor_id'))->toBe($vendorB->id);
});

test('admin can delete product', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($admin)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(204);
    expect(Product::count())->toBe(0);
});

test('vendor can create product', function () {
    Storage::fake('s3');

    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($vendor)->post('/api/products', [
        'name' => 'Vendor Product',
        'description' => 'Vendor Description',
        'price' => 49.99,
        'image' => UploadedFile::fake()->image('vendor.png'),
        'last30DaysPrice' => 54.99,
        'quantity' => 10,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(201);
    expect($response->json('name'))->toBe('Vendor Product');
    expect($response->json('vendor_id'))->toBe($vendor->id);
    expect($response->json('imageURL'))->toBeString();
});

test('vendor cannot specify a vendor id when creating a product', function () {
    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $otherVendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($vendor)->post('/api/products', [
        'name' => 'Vendor Product',
        'description' => 'Vendor Description',
        'price' => 49.99,
        'image' => UploadedFile::fake()->image('vendor.png'),
        'quantity' => 10,
        'vendor_id' => $otherVendor->id,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['vendor_id']);
});

test('vendor can update own product', function () {
    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $product = Product::factory()->create(['vendor_id' => $vendor->id]);

    $response = $this->actingAs($vendor)->putJson("/api/products/{$product->id}", [
        'name' => 'Updated Vendor Product',
    ]);

    $response->assertStatus(200);
    expect($response->json('name'))->toBe('Updated Vendor Product');
});

test('vendor cannot update another vendors product', function () {
    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $otherVendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $product = Product::factory()->create(['vendor_id' => $otherVendor->id]);

    $response = $this->actingAs($vendor)->putJson("/api/products/{$product->id}", [
        'name' => 'Hijacked Product',
    ]);

    $response->assertStatus(403);
});

test('vendor cannot delete another vendors product', function () {
    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $otherVendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $product = Product::factory()->create(['vendor_id' => $otherVendor->id]);

    $response = $this->actingAs($vendor)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(403);
});

test('vendor can delete own product', function () {
    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $product = Product::factory()->create(['vendor_id' => $vendor->id]);

    $response = $this->actingAs($vendor)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(204);
    expect(Product::count())->toBe(0);
});

test('superadmin can create product', function () {
    Storage::fake('s3');

    $superadmin = User::factory()->create([
        'scope' => ScopeEnum::SUPERADMIN,
    ]);

    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($superadmin)->post('/api/products', [
        'name' => 'Superadmin Product',
        'description' => 'Superadmin Description',
        'price' => 99.99,
        'image' => UploadedFile::fake()->image('superadmin.png'),
        'last30DaysPrice' => 109.99,
        'quantity' => 10,
        'vendor_id' => $vendor->id,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(201);
    expect($response->json('name'))->toBe('Superadmin Product');
    expect($response->json('imageURL'))->toBeString();
});

test('superadmin can update product', function () {
    $superadmin = User::factory()->create([
        'scope' => ScopeEnum::SUPERADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($superadmin)->putJson("/api/products/{$product->id}", [
        'name' => 'Updated Superadmin Product',
    ]);

    $response->assertStatus(200);
    expect($response->json('name'))->toBe('Updated Superadmin Product');
});

test('superadmin can delete product', function () {
    $superadmin = User::factory()->create([
        'scope' => ScopeEnum::SUPERADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($superadmin)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(204);
    expect(Product::count())->toBe(0);
});

test('support role cannot create product', function () {
    $support = User::factory()->create([
        'scope' => ScopeEnum::SUPPORT,
    ]);

    $response = $this->actingAs($support)->post('/api/products', [
        'name' => 'Support Product',
        'description' => 'Support Description',
        'price' => 19.99,
        'image' => UploadedFile::fake()->image('support.png'),
        'last30DaysPrice' => 24.99,
        'quantity' => 10,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(403);
});

test('create product requires quantity', function () {
    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($vendor)->post('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'image' => UploadedFile::fake()->image('image.png'),
    ], ['Accept' => 'application/json']);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['quantity']);
});

test('create product rejects negative quantity', function () {
    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($vendor)->post('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'image' => UploadedFile::fake()->image('image.png'),
        'quantity' => -1,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['quantity']);
});

test('create product validation errors', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $response = $this->actingAs($admin)->post('/api/products', [], ['Accept' => 'application/json']);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name', 'description', 'price', 'image', 'quantity', 'vendor_id']);
});

test('update product validation errors', function () {
    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($admin)->putJson("/api/products/{$product->id}", [
        'price' => -10,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['price']);
});

test('create product rejects a non-image file', function () {
    $vendor = User::factory()->create([
        'scope' => ScopeEnum::VENDOR,
    ]);

    $response = $this->actingAs($vendor)->post('/api/products', [
        'name' => 'Test Product',
        'description' => 'Test Description',
        'price' => 29.99,
        'image' => UploadedFile::fake()->create('document.txt', 100),
        'quantity' => 10,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['image']);
});

test('admin can update product image', function () {
    Storage::fake('s3');

    $admin = User::factory()->create([
        'scope' => ScopeEnum::ADMIN,
    ]);

    $product = Product::factory()->create();

    $response = $this->actingAs($admin)->post("/api/products/{$product->id}", [
        '_method' => 'PUT',
        'image' => UploadedFile::fake()->image('new-image.png'),
    ], ['Accept' => 'application/json']);

    $response->assertStatus(200);
    expect($response->json('imageURL'))->toBeString();
});
