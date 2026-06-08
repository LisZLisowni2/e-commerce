<?php

use App\Models\Product;
use Illuminate\Support\Facades\Log;

test('display 3 products', function() {
    Product::factory(3)->create();

    $response = $this->getJson('/api/products');

    $response->assertStatus(200);
    expect($response->json()["products"]->count())->toBe(3);
});